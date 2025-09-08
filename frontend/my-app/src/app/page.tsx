import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ArgoExplorer } from "@/components/ArgoExplorer";
import { AiChatInterface } from "@/components/AiChatInterface";
import { TechStack } from "@/components/TechStack";
import { Footer } from "@/components/Footer";
import { Features } from "@/components/Features";
import { DataOverview } from "@/components/DataOverview";
import { StatsSection } from "@/components/StatsSection";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main>

        <Hero />
        <StatsSection />
        <Features />
        <DataOverview />
        <ArgoExplorer />
        <AiChatInterface />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
}
