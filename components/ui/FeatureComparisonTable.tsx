import React from "react";
import { useTranslations } from "next-intl";

interface FeatureComparisonItem {
  feature: string;
  euValue: string;
  usValue: string;
  notes?: string;
}

interface FeatureComparisonData {
  usToolName: string;
  items: FeatureComparisonItem[];
}

interface FeatureComparisonTableProps {
  comparisonData?: FeatureComparisonData;
  euToolName?: string;
}

export const FeatureComparisonTable: React.FC<
  FeatureComparisonTableProps
> = ({ comparisonData, euToolName = "This Service" }) => {
  const t = useTranslations("FeatureComparisonTable"); // Namespace for translations

  if (!comparisonData || comparisonData.items.length === 0) {
    return <p>{t("noData")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700"
            >
              {t("feature")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700"
            >
              {euToolName}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {comparisonData.usToolName}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {comparisonData.items.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                  {item.feature}
                </td>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/30 border-r border-gray-200 dark:border-gray-700">
                  {item.euValue}
                </td>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/30">
                  {item.usValue}
                </td>
              </tr>
              {item.notes && (
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td
                    colSpan={3}
                    className="px-6 py-3 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <span className="font-semibold">{t("notes")}:</span>{" "}
                    {item.notes}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
