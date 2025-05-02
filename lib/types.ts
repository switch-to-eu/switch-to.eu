export type Service = {
  name: string;
  isEU: boolean | null;
  euFriendly: boolean | null;
  pattern?: string;
};

export type AnalysisStep = {
  type: "mx_records" | "domain_registrar" | "hosting" | "cdn" | "services";
  status: "pending" | "processing" | "complete";
  details: string | Service[] | null;
  isEU: boolean | null;
  euFriendly: boolean | null;
};
