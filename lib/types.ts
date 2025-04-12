export type Service = {
  name: string;
  isEU: boolean | null;
};

export type AnalysisStep = {
  type: string;
  title: string;
  status: "pending" | "processing" | "complete";
  details: string | Service[] | null;
  isEU: boolean | null;
};
