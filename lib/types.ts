export type Service = {
  name: string;
  isEU: boolean | null;
  euFriendly: boolean | null;
  pattern?: string;
};

export type AnalysisStep = {
  type: string;
  status: "pending" | "processing" | "complete";
  details: string | Service[] | null;
  isEU: boolean | null;
  euFriendly: boolean | null;
};
