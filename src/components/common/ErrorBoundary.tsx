"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw, Compass } from "lucide-react";
import Button from "../ui/Button";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-luxury-cream dark:bg-emerald-deep px-6 text-center font-sans">
          <div className="max-w-md border border-gold/15 p-8 sm:p-10 rounded-sm bg-white dark:bg-emerald-deep/40 shadow-xl flex flex-col items-center gap-6 relative overflow-hidden">
            {/* Ambient luxury accent circles */}
            <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-gold/5 blur-xl" />
            <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-gold/5 blur-xl" />

            <div className="h-16 w-16 rounded-full border border-gold/25 flex items-center justify-center text-gold bg-emerald-rich/5 dark:bg-emerald-accent/15 shrink-0 animate-pulse">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">
                Luxury Flow Disturbance
              </span>
              <h1 className="font-display text-3xl font-bold text-emerald-rich dark:text-gold leading-tight">
                An Unexpected Exception Occurred
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1 font-light">
                A rare disturbance has occurred in our premium booking flow. Our private concierge hosts have been logged.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-red-500/5 dark:bg-red-400/5 border border-red-500/10 p-3 rounded-sm text-left max-h-28 overflow-y-auto">
                <span className="text-[9px] font-mono text-red-500/80 font-bold uppercase tracking-wider block">
                  Exception Log
                </span>
                <p className="text-[10px] font-mono text-red-600 dark:text-red-400 mt-0.5 break-all">
                  {this.state.error.message || this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Button
                variant="luxury"
                size="md"
                className="w-full flex items-center justify-center gap-2 text-xs"
                onClick={this.handleReset}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reload Estate
              </Button>
              <Link href="/" className="w-full">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 text-xs text-emerald-rich border-gold/20 hover:bg-gold/10"
                >
                  <Compass className="h-3.5 w-3.5 text-gold-dark" /> Main Lounge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
