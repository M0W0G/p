"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper, Stack, Button, Chip, Divider } from "@mui/material";

import type { SortingStep } from "@/lib/firebase/types";

type ContainerId = "bank" | string; // "bank" or bucketId
type Placements = Record<string /*cardId*/, ContainerId>;

interface SortingStepViewProps {
  step: SortingStep;

  // parent can use this to gate Next
  onSubmittedChange?: (submitted: boolean) => void;

  // optional for future persistence
  onPlacementsChange?: (placements: Placements) => void;

  // if true: after submit, user cannot move cards
  lockAfterSubmit?: boolean;
}

function buildInitialPlacements(step: SortingStep): Placements {
  const placements: Placements = {};
  for (const c of step.cards) placements[c.id] = "bank";
  return placements;
}

function groupCards(step: SortingStep, placements: Placements) {
  const bank: SortingStep["cards"] = [];
  const byBucket: Record<string, SortingStep["cards"]> = {};

  for (const b of step.buckets) byBucket[b.id] = [];

  for (const card of step.cards) {
    const where = placements[card.id] ?? "bank";
    if (where === "bank") bank.push(card);
    else if (byBucket[where]) byBucket[where].push(card);
    else bank.push(card); // safety fallback if bucket removed
  }

  return { bank, byBucket };
}

function cardCountInContainer(placements: Placements, containerId: ContainerId) {
  let count = 0;
  for (const cardId of Object.keys(placements)) {
    if ((placements[cardId] ?? "bank") === containerId) count++;
  }
  return count;
}

export default function SortingStepView({
  step,
  onSubmittedChange,
  onPlacementsChange,
  lockAfterSubmit = false,
}: SortingStepViewProps) {
  const [placements, setPlacements] = useState<Placements>(() => buildInitialPlacements(step));
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<ContainerId | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset when step changes
  useEffect(() => {
    setPlacements(buildInitialPlacements(step));
    setDraggingCardId(null);
    setDragOverZone(null);
    setSubmitted(false);
    onSubmittedChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // Let parent observe placements (optional)
  useEffect(() => {
    onPlacementsChange?.(placements);
  }, [placements, onPlacementsChange]);

  const { bank, byBucket } = useMemo(() => groupCards(step, placements), [step, placements]);

  const containerIds: ContainerId[] = useMemo(
    () => ["bank", ...step.buckets.map((b) => b.id)],
    [step.buckets]
  );

  const canInteract = !(lockAfterSubmit && submitted);

  // ✅ Gate criteria: all cards must be placed into buckets (none left in bank)
  const allCardsPlaced = bank.length === 0;

  // ✅ If user changes placements after submit, revert submit
  useEffect(() => {
    if (!submitted) return;
    // If any card ends up back in bank (or any placement changes), treat as not submitted
    // Simple rule: if not all placed, cannot remain submitted.
    if (!allCardsPlaced) {
      setSubmitted(false);
      onSubmittedChange?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placements, allCardsPlaced]);

  const moveCardTo = (cardId: string, to: ContainerId) => {
    setPlacements((prev) => ({
      ...prev,
      [cardId]: to,
    }));
  };

  const handleReset = () => {
    if (!canInteract) return;
    setPlacements(buildInitialPlacements(step));
    setSubmitted(false);
    onSubmittedChange?.(false);
  };

  const handleSubmit = () => {
    // ✅ prevent submit unless all cards placed
    if (!allCardsPlaced) return;

    setSubmitted(true);
    onSubmittedChange?.(true);
  };

  // ---------- Native HTML handlers ----------
  const onCardDragStart = (e: React.DragEvent, cardId: string) => {
    if (!canInteract) {
      e.preventDefault();
      return;
    }
    setDraggingCardId(cardId);

    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onCardDragEnd = () => {
    setDraggingCardId(null);
    setDragOverZone(null);
  };

  const onZoneDragOver = (e: React.DragEvent, zoneId: ContainerId) => {
    if (!canInteract) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverZone !== zoneId) setDragOverZone(zoneId);
  };

  const onZoneDragLeave = (_e: React.DragEvent, zoneId: ContainerId) => {
    if (dragOverZone === zoneId) setDragOverZone(null);
  };

  const onZoneDrop = (e: React.DragEvent, zoneId: ContainerId) => {
    if (!canInteract) return;
    e.preventDefault();

    const cardId = e.dataTransfer.getData("text/plain");
    if (!cardId) return;

    if (!containerIds.includes(zoneId)) return;

    moveCardTo(cardId, zoneId);
    setDragOverZone(null);
    setDraggingCardId(null);
  };

  // ---------- UI ----------
  const Zone = ({
    id,
    title,
    hint,
    children,
    minHeight = 160,
  }: {
    id: ContainerId;
    title: string;
    hint?: string;
    children: React.ReactNode;
    minHeight?: number;
  }) => {
    const isOver = dragOverZone === id;

    return (
      <Paper
        elevation={0}
        onDragOver={(e) => onZoneDragOver(e, id)}
        onDragLeave={(e) => onZoneDragLeave(e, id)}
        onDrop={(e) => onZoneDrop(e, id)}
        sx={{
          borderRadius: "18px",
          border: "2px dashed",
          borderColor: isOver ? "primary.main" : "grey.300",
          bgcolor: isOver ? "primary.50" : "transparent",
          p: 2,
          minHeight,
          transition: "all 120ms ease",
        }}
      >
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" mb={1}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: "1rem" }}>{title}</Typography>
            {hint ? (
              <Typography sx={{ color: "grey.600", fontSize: "0.85rem" }}>{hint}</Typography>
            ) : null}
          </Box>

          <Chip
            size="small"
            label={`${cardCountInContainer(placements, id)} card${
              cardCountInContainer(placements, id) === 1 ? "" : "s"
            }`}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        <Stack spacing={1.25}>{children}</Stack>
      </Paper>
    );
  };

  const Card = ({ card }: { card: SortingStep["cards"][number] }) => {
    const isDragging = draggingCardId === card.id;

    return (
      <Paper
        draggable={canInteract}
        onDragStart={(e) => onCardDragStart(e, card.id)}
        onDragEnd={onCardDragEnd}
        elevation={0}
        sx={{
          px: 1.5,
          py: 1.25,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "grey.300",
          bgcolor: "grey.50",
          opacity: isDragging ? 0.35 : 1,
          cursor: canInteract ? "grab" : "default",
          userSelect: "none",
          transition: "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
          "&:hover": canInteract
            ? {
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                transform: "translateY(-1px)",
              }
            : {},
        }}
      >
        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>{card.text}</Typography>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
          Sorting Question
        </Typography>
        <Typography sx={{ color: "grey.700", fontSize: "1.05rem" }}>
          {step.prompt}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Controls */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap">
        <Chip
          label={submitted ? "Submitted" : "Not submitted"}
          color={submitted ? "success" : "default"}
          variant={submitted ? "filled" : "outlined"}
          sx={{ fontWeight: 700 }}
        />

        {!submitted && !allCardsPlaced && (
          <Chip
            label={`Place ${bank.length} more card${bank.length === 1 ? "" : "s"} to submit`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        )}

        <Box sx={{ flex: 1 }} />

        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={!canInteract}
          sx={{ borderRadius: "14px" }}
        >
          Reset
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!allCardsPlaced || submitted}
          sx={{
            borderRadius: "14px",
            bgcolor: (t) => t.palette.common.black,
            "&:hover": { bgcolor: (t) => t.palette.grey[800] },
            "&.Mui-disabled": {
              bgcolor: "grey.300",
              color: "grey.600",
            },
          }}
        >
          Submit
        </Button>
      </Stack>

      {/* Layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        {/* Bank */}
        <Zone id="bank" title="Card Bank" hint="Drag cards into the buckets on the right." minHeight={280}>
          {bank.length === 0 ? (
            <Typography sx={{ color: "grey.500", fontStyle: "italic" }}>
              No cards left in the bank.
            </Typography>
          ) : (
            bank.map((c) => <Card key={c.id} card={c} />)
          )}
        </Zone>

        {/* Buckets */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
          {step.buckets.map((bucket) => {
            const bucketCards = byBucket[bucket.id] ?? [];
            return (
              <Zone
                key={bucket.id}
                id={bucket.id}
                title={bucket.label}
                hint="Drop cards here"
                minHeight={160}
              >
                {bucketCards.length === 0 ? (
                  <Typography sx={{ color: "grey.500", fontStyle: "italic" }}>
                    Drop cards into this bucket.
                  </Typography>
                ) : (
                  bucketCards.map((c) => <Card key={c.id} card={c} />)
                )}
              </Zone>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}