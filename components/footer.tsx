'use client';

import { useDomain } from '@/lib/use-domain';
import { useTheme } from '@/lib/theme-provider';
import { Section, Container } from '@/components/craft';
import Balancer from "react-wrap-balancer";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Twitter, Instagram, Youtube } from 'lucide-react';
import { FaTelegram, FaTiktok, FaYoutube } from 'react-icons/fa'

export function Footer() {
  const { site, isBitcoinArg } = useDomain();
  const { theme } = useTheme();

  return (
    <footer>
      <Section>
        <Container className="grid md:grid-cols-[1.5fr_0.5fr_1fr] gap-12 h-full">
          <div className="flex flex-col gap-6 not-prose">
            <Link href="/" className="flex items-center gap-4">
              <Image
                src={theme === 'dark' ? site.logoDark : site.logo}
                alt={site.name}
                width={42}
                height={26.44}
              />
              <h3 className="text-xl font-medium">{site.name}</h3>
            </Link>

              <p>
                <Balancer>+8 años informando sobre criptomonedas en Argentina y Latinoamérica.</Balancer>
              </p>
            
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <h5 className="font-medium text-base">Social</h5>
            <div className="flex gap-4">
              {site.socialLinks.instagram && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} />
                </Link>
              )}
              {site.socialLinks.telegram && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTelegram size={20} />
                </Link>
              )}
              {site.socialLinks.tiktok && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTiktok size={20} />
                </Link>
              )}
              {site.socialLinks.youtube && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaYoutube size={20} />
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="font-medium text-base">Publicidad</h5>
            <p className="text-sm">¿Querés aparecer en nuestra web?</p>
            <p className="text-sm text-muted-foreground">Llegá a miles de lectores interesados en criptomonedas y blockchain.</p>
            <a 
              href={`mailto:${site.socialLinks.email}`}
              className="text-sm text-primary hover:underline font-medium"
            >
              Contactanos → {site.socialLinks.email}
            </a>
          </div>
        </Container>
        <Container className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
            <br />
            Una empresa de Bitcoin Argentina Group.
          </p>
        </Container>
      </Section>
    </footer>
  );
} 