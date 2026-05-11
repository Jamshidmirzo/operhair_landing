"use client";

import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Item = { q: string; a: string };

type Filter = "all" | "clients" | "barbers";

export type FaqLabels = {
  tabs: { all: string; clients: string; barbers: string };
  clients: Item[];
  barbers: Item[];
};

/**
 * Client island for the FAQ section: tab filter + accordion. We do not use
 * TabsContent here because we render a single accordion below and just slice
 * the data based on the active tab — much less DOM duplication.
 */
export function FaqContent({ labels }: { labels: FaqLabels }) {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo<Array<Item & { id: string }>>(() => {
    const clients = labels.clients.map((it, i) => ({ ...it, id: `c-${i}` }));
    const barbers = labels.barbers.map((it, i) => ({ ...it, id: `b-${i}` }));
    if (filter === "clients") return clients;
    if (filter === "barbers") return barbers;
    return [...clients, ...barbers];
  }, [filter, labels.barbers, labels.clients]);

  return (
    <div>
      <Tabs
        value={filter}
        onValueChange={(value) => {
          if (
            value === "all" ||
            value === "clients" ||
            value === "barbers"
          ) {
            setFilter(value);
          }
        }}
      >
        <TabsList className="self-start">
          <TabsTrigger value="all">{labels.tabs.all}</TabsTrigger>
          <TabsTrigger value="clients">{labels.tabs.clients}</TabsTrigger>
          <TabsTrigger value="barbers">{labels.tabs.barbers}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Re-mount accordion when filter changes so panels are reset cleanly. */}
      <Accordion key={filter} className="mt-8">
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
