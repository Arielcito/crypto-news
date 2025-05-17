'use client';

// Craft Imports
import { Section, Container } from "@/components/craft";
import { TelegramChannel } from "@/components/newsletter";
import { PostsSection } from "@/components/posts-section";
import { getCurrentDomain } from "@/lib/domain-colors";

// Next.js Imports
import { useEffect, useState } from "react";

// This page is using the craft.tsx component and design system
export default function Home() {
  const [domain, setDomain] = useState<string>('localhost');

  useEffect(() => {
    // Initial domain check
    setDomain(getCurrentDomain());

    // Listen for domain changes
    const handleDomainChange = () => {
      setDomain(getCurrentDomain());
    };

    window.addEventListener('domain-changed', handleDomainChange);
    return () => window.removeEventListener('domain-changed', handleDomainChange);
  }, []);

  return (
    <>
      <Section>
        <Container>
          <main className="space-y-12">
            <PostsSection />
            <TelegramChannel key={domain} />
          </main>
        </Container>
      </Section>
    </>
  );
}

