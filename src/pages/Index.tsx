import Header from "@/components/Header";
import SurfboardScroll from "@/components/SurfboardScroll";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <SurfboardScroll />
      <Features />
      <Footer />
    </main>
  );
};

export default Index;
