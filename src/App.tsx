import { useState } from "react";
import { Layout } from "./components/layout/Layout";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { CompaniesPage } from "./components/companies/CompaniesPage";
import { ApplicationsPage } from "./components/applications/ApplicationsPage";
import { InterviewsPage } from "./components/interviews/InterviewsPage";

type Page = "dashboard" | "companies" | "applications" | "interviews";
export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const content = {
    dashboard: <DashboardPage />,
    companies: <CompaniesPage />,
    applications: <ApplicationsPage />,
    interviews: <InterviewsPage />,
  }[page];

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {content}
    </Layout>
  );
}