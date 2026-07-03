interface IpGuideResponse {
  ip: string;
  network: {
    cidr: string;
    hosts: { start: string; end: string };
    autonomous_system: {
      asn: number;
      name: string;
      organization: string;
      country: string;
      rir: string;
    };
  };
  location: {
    city: string;
    country: string;
    timezone: string;
    latitude: number;
    longitude: number;
  };
}

export interface GeoLocation {
  city: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  asn: number;
  org: string;
  formatted: string;
}

export async function lookupIp(ip: string): Promise<GeoLocation | null> {
  try {
    const res = await fetch(`https://ip.guide/${ip}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;

    const data: IpGuideResponse = await res.json();
    const loc = data.location;
    const as = data.network.autonomous_system;

    return {
      city: loc.city,
      country: loc.country,
      timezone: loc.timezone,
      latitude: loc.latitude,
      longitude: loc.longitude,
      asn: as.asn,
      org: as.organization,
      formatted: `${loc.city}, ${loc.country}`,
    };
  } catch {
    return null;
  }
}
