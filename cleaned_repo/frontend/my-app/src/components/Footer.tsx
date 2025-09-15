"use client";

import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Download,
  FileText,
  Shield,
  Users,
  Award
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks: { label: string; href: string }[] = [
    { label: "ARGO Data", href: "/details" },
    { label: "Ocean Analytics", href: "/dashboard" },
    { label: "AI Chatbot", href: "/chatbot" },
    { label: "Data Explorer", href: "/explorer" },
  ];

  const governmentLinks = [
    { label: "Ministry of Earth Sciences", href: "https://moes.gov.in" },
    { label: "INCOIS Official", href: "https://incois.gov.in" },
    { label: "Government of India", href: "https://india.gov.in" },
    { label: "Digital India", href: "https://digitalindia.gov.in" },
    { label: "MyGov", href: "https://mygov.in" },
    { label: "Data.gov.in", href: "https://data.gov.in" },
  ];

  const resources: { label: string; href: string }[] = [
    // Removed non-working internal links. Add only when pointing to real external docs.
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/incois", label: "Facebook" },
    { icon: Twitter, href: "https://x.com/incois", label: "Twitter" },
    { icon: Youtube, href: "https://www.youtube.com/@incois", label: "YouTube" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/incois", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gradient-to-b from-blue-50 to-blue-100 border-t border-blue-200">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* INCOIS ARGO Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-ocean rounded-full flex items-center justify-center ocean-wave">
                <div className="text-xl text-primary-foreground font-bold">🌊</div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-deep">INCOIS ARGO</h3>
                <p className="text-sm text-muted-foreground">AI-Powered Ocean Data</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Advanced AI-powered platform for accessing, analyzing, and visualizing 
              ARGO oceanographic data through natural language queries and interactive dashboards.
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.label}
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 hover:bg-primary/10"
                    title={social.label}
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                      <Icon className="w-4 h-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-deep flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Government Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-deep flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Government</span>
            </h4>
            <ul className="space-y-2">
              {governmentLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-deep flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Contact & Resources</span>
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>INCOIS, Pragathi Nagar</p>
                  <p>Hyderabad - 500090, Telangana</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">+91-40-2389-5000</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">info@incois.gov.in</span>
              </div>
            </div>
            <div className="space-y-2">
              {resources.map((resource) => (
                <a
                  key={resource.label}
                  href={resource.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center space-x-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>{resource.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-200 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              <p>&copy; {currentYear} Indian National Centre for Ocean Information Services (INCOIS)</p>
              <p>Ministry of Earth Sciences, Government of India. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-6 text-sm" />
          </div>
        </div>

        {/* Government Footer Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>
              This is the official website of INCOIS, Ministry of Earth Sciences, Government of India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};