import { Hospital, PatientRequest, RankedHospitalResult, MatchScoreBreakdown } from '../types';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function estimateTravelMinutes(distanceKm: number): number {
  // Emergency vehicle with priority sirens in metropolitan grid
  const baseMinutes = (distanceKm / 38) * 60 + 2.5;
  return Math.max(3, Math.round(baseMinutes));
}

export function rankHospitals(
  hospitals: Hospital[],
  request: PatientRequest,
  now = Date.now()
): RankedHospitalResult[] {
  const ranked: RankedHospitalResult[] = hospitals.map((hospital) => {
    const dist = calculateDistanceKm(
      request.location.lat,
      request.location.lng,
      hospital.coordinates.lat,
      hospital.coordinates.lng
    );
    const travelMins = estimateTravelMinutes(dist);

    // Bed availability
    const bedInfo = hospital.beds[request.requiredBedType] || { available: 0, total: 0 };
    const availableCount = bedInfo.available;
    const hasBed = availableCount > 0;

    // Specialty match
    const specialtyNeeded = request.requiredSpecialty !== 'none';
    const specialtyMatched = specialtyNeeded
      ? hospital.specialties.includes(request.requiredSpecialty)
      : true;

    // 1. Bed Match Score (Max 40 points)
    let bedMatchPoints = 0;
    if (!hasBed) {
      bedMatchPoints = 2; // Critical lack of bed
    } else if (availableCount === 1) {
      bedMatchPoints = 28;
    } else if (availableCount === 2) {
      bedMatchPoints = 35;
    } else {
      bedMatchPoints = 40;
    }

    if (specialtyNeeded && !specialtyMatched) {
      bedMatchPoints = Math.round(bedMatchPoints * 0.45); // Penalty if specialty missing
    }

    // 2. Travel Time Score (Max 25 points)
    let travelTimePoints = 0;
    if (travelMins <= 8) {
      travelTimePoints = 25;
    } else if (travelMins <= 14) {
      travelTimePoints = 20;
    } else if (travelMins <= 20) {
      travelTimePoints = 14;
    } else if (travelMins <= 28) {
      travelTimePoints = 8;
    } else {
      travelTimePoints = Math.max(2, 25 - travelMins);
    }

    // 3. Data Freshness Score (Max 20 points)
    const dataAgeMinutes = Math.max(0, Math.floor((now - hospital.lastUpdated) / (1000 * 60)));
    let freshnessPoints = 0;
    if (dataAgeMinutes <= 3) {
      freshnessPoints = 20;
    } else if (dataAgeMinutes <= 8) {
      freshnessPoints = 17;
    } else if (dataAgeMinutes <= 15) {
      freshnessPoints = 12;
    } else if (dataAgeMinutes <= 25) {
      freshnessPoints = 6;
    } else {
      freshnessPoints = 2;
    }

    // 4. Current Load Score (Max 15 points)
    let loadPoints = 0;
    if (hospital.edBypassStatus === 'diverting') {
      loadPoints = 1;
    } else if (hospital.currentLoad < 65) {
      loadPoints = 15;
    } else if (hospital.currentLoad < 80) {
      loadPoints = 11;
    } else if (hospital.currentLoad < 90) {
      loadPoints = 6;
    } else {
      loadPoints = 2;
    }

    // Total Score (0-100)
    let totalScore = bedMatchPoints + travelTimePoints + freshnessPoints + loadPoints;
    if (!hasBed) {
      totalScore = Math.min(35, totalScore);
    }
    if (hospital.edBypassStatus === 'diverting') {
      totalScore = Math.min(38, totalScore);
    }

    // Generate clinical explanation tags and warnings
    const reasons: string[] = [];
    const warnings: string[] = [];

    if (hasBed) {
      reasons.push(`${availableCount} ${request.requiredBedType.toUpperCase()} bed${availableCount > 1 ? 's' : ''} available`);
    } else {
      warnings.push(`0 ${request.requiredBedType.toUpperCase()} beds available`);
    }

    if (availableCount === 1) {
      warnings.push('Only one matching bed remains');
    }

    if (specialtyNeeded) {
      if (specialtyMatched) {
        reasons.push(`${request.requiredSpecialty.toUpperCase()} specialty match confirmed`);
      } else {
        warnings.push(`Lacks ${request.requiredSpecialty.toUpperCase()} specialty service`);
      }
    }

    if (travelMins <= 12) {
      reasons.push(`Fast ETA: ~${travelMins} min drive (${dist} km)`);
    } else {
      warnings.push('Travel time may change due to traffic');
    }

    if (dataAgeMinutes > 20) {
      warnings.push(`Availability data is ${dataAgeMinutes} minutes old`);
    } else if (dataAgeMinutes <= 3) {
      reasons.push(`Data verified fresh (${dataAgeMinutes === 0 ? 'just now' : `${dataAgeMinutes}m ago`})`);
    }

    if (hospital.currentLoad >= 85) {
      warnings.push('Hospital is currently near capacity');
    }

    if (hospital.edBypassStatus === 'diverting') {
      warnings.push('Hospital is currently on ED bypass diversion');
    }

    const scoreBreakdown: MatchScoreBreakdown = {
      bedMatch: bedMatchPoints,
      travelTime: travelTimePoints,
      freshness: freshnessPoints,
      currentLoad: loadPoints,
      totalScore,
      travelMinutes: travelMins,
      distanceKm: dist,
      dataAgeMinutes,
      availableMatchingBeds: availableCount,
      specialtyMatched,
      reasons,
      warnings,
    };

    return {
      hospital,
      score: scoreBreakdown,
      rank: 1,
    };
  });

  // Sort descending by total score, then travelMinutes ascending
  ranked.sort((a, b) => {
    if (b.score.totalScore !== a.score.totalScore) {
      return b.score.totalScore - a.score.totalScore;
    }
    return a.score.travelMinutes - b.score.travelMinutes;
  });

  return ranked.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
