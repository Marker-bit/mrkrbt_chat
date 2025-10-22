"use client";

import { Button } from "@/components/ui/button";
import config from "@/lib/config";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function WelcomeScreen({
  onSelect,
}: {
  onSelect: (item: string) => void;
}) {
  const welcomeScreen = config.welcomeScreen;
  const [activeTab, setActiveTab] = useState(-1);
  const [direction, setDirection] = useState<number>(-1);
  const itemsToShow =
    activeTab === -1
      ? welcomeScreen.default
      : welcomeScreen.tabs[activeTab].items;

  return (
    <div className="flex flex-col gap-2 w-full">
      <h1 className="text-3xl font-semibold">How can I help you?</h1>
      <div className="flex gap-2 max-sm:justify-around w-full">
        {welcomeScreen.tabs.map((tab, i) => (
          <Button
            key={tab.title}
            variant={activeTab === i ? "default" : "outline"}
            onClick={() => {
              const prevActiveTab = activeTab;
              if (activeTab === i) {
                setActiveTab(-1);
                setDirection(-1);
              } else {
                setActiveTab(i);
                setDirection(prevActiveTab < i ? 1 : -1);
              }
            }}
            className={cn(
              "sm:rounded-full max-sm:flex-col max-sm:size-16 transition-all",
              activeTab === i && "border border-transparent",
            )}
          >
            <tab.icon />
            {tab.title}
          </Button>
        ))}
      </div>
      <div className="overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            className="flex flex-col divide-y divide-accent items-stretch"
            key={activeTab}
            variants={{
              initial: (direction) => {
                return { x: `${110 * direction}%`, opacity: 0 };
              },
              active: { x: "0%", opacity: 1 },
              exit: (direction) => {
                return { x: `${-110 * direction}%`, opacity: 0 };
              },
            }}
            initial="initial"
            animate="active"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.5, type: "spring", bounce: 0 }}
          >
            {itemsToShow.map((item) => (
              <div key={item} className="p-1">
                <button
                  onClick={() => onSelect(item)}
                  className="p-2 hover:bg-secondary/50 w-full rounded-md text-start text-secondary-foreground"
                >
                  {item}
                </button>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
