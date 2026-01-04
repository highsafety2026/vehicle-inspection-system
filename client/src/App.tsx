import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallPrompt } from "@/components/InstallPrompt";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import CreateInspection from "@/pages/CreateInspection";
import InspectionDetail from "@/pages/InspectionDetail";
import { InspectionPage } from "@/pages/InspectionPage";
import Report from "@/pages/Report";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/create" component={CreateInspection} />
      <Route path="/inspections/new" component={CreateInspection} />
      <Route path="/inspections/:id" component={InspectionDetail} />
      <Route path="/inspection/:id" component={InspectionPage} />
      <Route path="/inspections/:id/report" component={Report} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        <InstallPrompt />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
