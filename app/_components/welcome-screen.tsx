"use client";

import { Button } from "@/components/ui/button";
import config from "@/lib/config";
import { useState } from "react";

export default function WelcomeScreen({onSelect}: {onSelect: (item: string) => void}) {
  const welcomeScreen = config.welcomeScreen;
  const [activeTab, setActiveTab] = useState(-1);
  const itemsToShow =
    activeTab === -1
      ? welcomeScreen.default
      : welcomeScreen.tabs[activeTab].items;

  return (
    <div className="flex flex-col gap-2 w-full">
      <h1 className="text-3xl font-semibold">How can I help you?</h1>
      <div className="flex gap-2">
        {welcomeScreen.tabs.map((tab, i) => (
          <Button
            key={tab.title}
            variant={activeTab === i ? "default" : "outline"}
            onClick={() =>
              activeTab === i ? setActiveTab(-1) : setActiveTab(i)
            }
            className="rounded-full"
          >
            <tab.icon />
            {tab.title}
          </Button>
        ))}
      </div>
      <div className="flex flex-col divide-y divide-accent items-stretch">
        {itemsToShow.map((item) => (
          <div key={item} className="p-1">
            <button onClick={() => onSelect(item)} className="p-2 hover:bg-secondary/50 w-full rounded-md text-start text-secondary-foreground">{item}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
