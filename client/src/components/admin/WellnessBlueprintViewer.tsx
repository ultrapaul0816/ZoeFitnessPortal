import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";
import {
  Wand2,
  RefreshCw,
  CheckCircle2,
  Download,
  Edit3,
  Shield,
  Dumbbell,
  Brain,
  Heart,
  Utensils,
  ChefHat,
  Target,
  Sparkles,
  ArrowRight,
  Flame,
  Droplets,
  Clock,
  ChevronRight,
  Activity,
  Zap,
  Star,
} from "lucide-react";
import type {
  BlueprintData,
  BlueprintRecipeCard,
  EquipmentItem,
  MindsetWeek,
} from "./WellnessBlueprintTypes";
import { EQUIPMENT_CATEGORY_COLORS, MEAL_TYPE_COLORS } from "./WellnessBlueprintTypes";

interface WellnessBlueprintViewerProps {
  blueprint: BlueprintData;
  isAdmin?: boolean;
  isApproved?: boolean;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  onApprove?: () => void;
  onExportPDF?: () => void;
}

// ===== Section Components =====

function CoverSection({ data }: { data: BlueprintData["coverPage"] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF8F3] via-[#F5F0E8] to-[#EDE6D8] p-10 md:p-16 text-center">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      <div className="absolute top-6 left-6 w-16 h-16 border border-amber-300/30 rounded-full" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border border-amber-300/30 rounded-full" />

      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-700/60 font-medium mb-6">
          The Boutique Wellness Blueprint
        </p>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-4 leading-tight">
          {data.clientName}
        </h1>
        <div className="w-20 h-0.5 bg-amber-400/60 mx-auto mb-4" />
        <p className="font-serif text-xl md:text-2xl text-stone-600 italic mb-8">
          {data.subtitle}
        </p>
        <p className="text-xs uppercase tracking-[0.25em] text-stone-400 font-medium">
          {data.tagline}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Badge variant="outline" className="bg-white/60 text-stone-600 border-stone-300 text-xs px-3">
            {data.coachingType}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ExecutiveArchitectureSection({ data }: { data: BlueprintData["executiveArchitecture"] }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Target className="w-5 h-5" />}
        title="Executive Performance Architecture"
        subtitle="Your strategic transformation compass"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FAF8F3] rounded-xl p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-800">Mission</h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{data.mission}</p>
        </div>
        <div className="bg-[#FAF8F3] rounded-xl p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-800">Identity Shift</h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{data.identityShift}</p>
        </div>
        <div className="bg-[#FAF8F3] rounded-xl p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-800">Key Insight</h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed font-medium italic">
            "{data.keyInsight}"
          </p>
        </div>
      </div>
    </div>
  );
}

function MindsetRoadmapSection({ data }: { data: BlueprintData["mindsetRoadmap"] }) {
  const weeks: { key: keyof typeof data; number: number; week: MindsetWeek }[] = [
    { key: "week1", number: 1, week: data.week1 },
    { key: "week2", number: 2, week: data.week2 },
    { key: "week3", number: 3, week: data.week3 },
    { key: "week4", number: 4, week: data.week4 },
  ];

  const weekColors = [
    { bg: "bg-sky-50", border: "border-sky-200", accent: "bg-sky-500", text: "text-sky-700" },
    { bg: "bg-violet-50", border: "border-violet-200", accent: "bg-violet-500", text: "text-violet-700" },
    { bg: "bg-amber-50", border: "border-amber-200", accent: "bg-amber-500", text: "text-amber-700" },
    { bg: "bg-emerald-50", border: "border-emerald-200", accent: "bg-emerald-500", text: "text-emerald-700" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Brain className="w-5 h-5" />}
        title="Phase 1: 4-Week Mindset Roadmap"
        subtitle="Your psychological transformation journey"
      />

      {/* Timeline connector */}
      <div className="relative">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-300 via-violet-300 via-amber-300 to-emerald-300 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {weeks.map((w, i) => (
            <div key={w.key} className="relative z-10">
              <div className={cn("rounded-xl p-5 border", weekColors[i].bg, weekColors[i].border)}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold", weekColors[i].accent)}>
                    {w.number}
                  </div>
                  <span className={cn("text-xs font-semibold uppercase tracking-wide", weekColors[i].text)}>
                    Week {w.number}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-stone-800 mb-2">{w.week.theme}</h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-3">{w.week.focus}</p>
                <div className="flex items-start gap-1.5 bg-white/60 rounded-lg p-2.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-stone-700 font-medium">{w.week.actionItem}</span>
                </div>
              </div>
              {i < 3 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 z-20 -translate-y-1/2">
                  <ArrowRight className="w-5 h-5 text-stone-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MedicalPillarSection({ data }: { data: BlueprintData["medicalPillar"] }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Heart className="w-5 h-5" />}
        title="Phase 2: Hormonal & Medical Pillar"
        subtitle="Your health-optimized foundation"
      />
      <div className="bg-[#FAF8F3] rounded-xl border border-amber-100 p-6 md:p-8">
        <p className="text-sm text-stone-600 leading-relaxed mb-6">{data.overview}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Considerations */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              Health Considerations
            </h4>
            <ul className="space-y-2">
              {data.considerations.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-stone-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Adaptations */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Smart Adaptations
            </h4>
            <ul className="space-y-2">
              {data.adaptations.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-stone-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {data.doctorClearance && (
          <>
            <Separator className="my-5" />
            <div className="flex items-start gap-3 bg-white/60 rounded-lg p-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-stone-700 mb-0.5">Doctor Clearance</p>
                <p className="text-xs text-stone-500">{data.doctorClearance}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StructuralIntegritySection({ data }: { data: BlueprintData["structuralIntegrity"] }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Shield className="w-5 h-5" />}
        title={`Structural Integrity: ${data.title}`}
        subtitle="Your body-smart movement strategy"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Concerns & Avoid */}
        <div className="space-y-5">
          <div className="bg-rose-50 rounded-xl border border-rose-100 p-5">
            <h4 className="font-serif text-sm font-semibold text-rose-800 mb-3">Primary Focus Areas</h4>
            <ul className="space-y-2">
              {data.primaryConcerns.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-rose-700">{i + 1}</span>
                  </div>
                  <span className="text-xs text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
            <h4 className="font-serif text-sm font-semibold text-amber-800 mb-3">Mindful Boundaries</h4>
            <ul className="space-y-2">
              {data.whatToAvoid.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">~</span>
                  <span className="text-xs text-stone-600 italic">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Protocols & Embrace */}
        <div className="space-y-5">
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
            <h4 className="font-serif text-sm font-semibold text-emerald-800 mb-3">Protocols</h4>
            <ul className="space-y-2">
              {data.protocols.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-sky-50 rounded-xl border border-sky-100 p-5">
            <h4 className="font-serif text-sm font-semibold text-sky-800 mb-3">Movements to Embrace</h4>
            <ul className="space-y-2">
              {data.whatToEmbrace.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function EquipmentAuditSection({ data }: { data: BlueprintData["equipmentAudit"] }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Dumbbell className="w-5 h-5" />}
        title="Asset Class: Elite Equipment Audit"
        subtitle="Your training toolkit"
      />
      <p className="text-sm text-stone-600">{data.overview}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.essentialEquipment.map((item: EquipmentItem, i: number) => {
          const colors = EQUIPMENT_CATEGORY_COLORS[item.category] || EQUIPMENT_CATEGORY_COLORS.Core;
          return (
            <div key={i} className={cn("rounded-xl p-4 border", colors.bg, colors.border)}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-serif text-sm font-semibold text-stone-800">{item.name}</h4>
                <Badge variant="outline" className={cn("text-[10px]", colors.bg, colors.text, colors.border)}>
                  {item.category}
                </Badge>
              </div>
              <p className="text-xs text-stone-500">{item.purpose}</p>
            </div>
          );
        })}
      </div>

      {data.recommendations.length > 0 && (
        <div className="bg-stone-50 rounded-xl border border-stone-200 p-5">
          <h4 className="font-serif text-sm font-semibold text-stone-700 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                <span className="text-xs text-stone-600">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NutritionBlueprintSection({ data }: { data: BlueprintData["nutritionBlueprint"] }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Utensils className="w-5 h-5" />}
        title="Nutrition Blueprint: Philosophy & Rituals"
        subtitle="Your fuel strategy"
      />

      <div className="bg-[#FAF8F3] rounded-xl border border-amber-100 p-6 md:p-8">
        <p className="text-sm text-stone-600 leading-relaxed italic mb-6">"{data.philosophy}"</p>

        {/* Daily Targets */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-amber-100">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-stone-800">{data.dailyTargets.calories}</p>
            <p className="text-[10px] uppercase tracking-wide text-stone-400">Calories</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-amber-100">
            <Dumbbell className="w-5 h-5 text-rose-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-stone-800">{data.dailyTargets.protein}</p>
            <p className="text-[10px] uppercase tracking-wide text-stone-400">Protein</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-amber-100">
            <Droplets className="w-5 h-5 text-sky-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-stone-800">{data.dailyTargets.hydration}</p>
            <p className="text-[10px] uppercase tracking-wide text-stone-400">Hydration</p>
          </div>
        </div>

        {/* Core Tenets */}
        <h4 className="font-serif text-sm font-semibold text-stone-700 mb-3">Core Tenets</h4>
        <div className="space-y-3 mb-5">
          {data.coreTenets.map((tenet, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-amber-700">{i + 1}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-800">{tenet.tenet}</p>
                <p className="text-xs text-stone-500 mt-0.5">{tenet.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Restrictions */}
        {data.restrictions.length > 0 && (
          <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
            <p className="text-[10px] uppercase tracking-wide text-rose-600 font-semibold mb-1.5">Dietary Notes</p>
            <div className="flex flex-wrap gap-1.5">
              {data.restrictions.map((r, i) => (
                <Badge key={i} variant="outline" className="text-[10px] bg-white text-rose-700 border-rose-200">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeCardsSection({ data }: { data: BlueprintRecipeCard[] }) {
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<ChefHat className="w-5 h-5" />}
        title="Signature Recipe Cards"
        subtitle="Personalized meals for your journey"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.map((recipe: BlueprintRecipeCard, i: number) => {
          const colors = MEAL_TYPE_COLORS[recipe.mealType] || MEAL_TYPE_COLORS.snack;
          const isExpanded = expandedRecipe === i;

          return (
            <div
              key={i}
              className={cn(
                "rounded-xl border overflow-hidden transition-all cursor-pointer",
                colors.border,
                isExpanded ? "ring-2 ring-amber-300" : "hover:shadow-md"
              )}
              onClick={() => setExpandedRecipe(isExpanded ? null : i)}
            >
              <div className={cn("p-5", colors.bg)}>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={cn("text-[10px]", colors.text, colors.border)}>
                    {recipe.mealType}
                  </Badge>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-stone-800 mb-1">{recipe.name}</h4>
                <p className="text-[10px] uppercase tracking-wide text-stone-500 font-medium">{recipe.tagline}</p>
              </div>

              <div className="p-5 bg-white">
                <p className="text-xs text-stone-600 italic mb-3">"{recipe.whyItWorks}"</p>

                {/* Macros bar */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium text-orange-600">{recipe.macros.calories} cal</span>
                  <span className="text-[10px] text-stone-400">|</span>
                  <span className="text-xs text-stone-500">P: {recipe.macros.protein}</span>
                  <span className="text-xs text-stone-500">C: {recipe.macros.carbs}</span>
                  <span className="text-xs text-stone-500">F: {recipe.macros.fat}</span>
                </div>

                {isExpanded && (
                  <div className="space-y-3 mt-3 pt-3 border-t border-stone-100">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold mb-1.5">Ingredients</p>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing, j) => (
                          <li key={j} className="text-xs text-stone-600 flex items-start gap-1.5">
                            <span className="text-amber-400 shrink-0">-</span>
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold mb-1.5">Instructions</p>
                      <p className="text-xs text-stone-600 leading-relaxed">{recipe.instructions}</p>
                    </div>
                  </div>
                )}

                {!isExpanded && (
                  <p className="text-[10px] text-amber-600 font-medium mt-1">Click to expand recipe</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Helper Components =====

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="font-serif text-xl font-bold text-stone-800">{title}</h2>
        <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ===== Main Component =====

function BlueprintSummaryCard({ blueprint }: { blueprint: BlueprintData }) {
  const [expanded, setExpanded] = useState(true);
  const mindsetWeeks = blueprint.mindsetRoadmap ? Object.keys(blueprint.mindsetRoadmap).length : 0;
  const recipeCount = blueprint.recipeCards?.length || 0;
  const generatedAt = (blueprint as any).generatedAt;

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-100/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span className="font-serif font-bold text-stone-800">Blueprint Summary</span>
          {generatedAt && (
            <span className="flex items-center gap-1 text-xs text-stone-400">
              <Calendar className="w-3 h-3" />
              Generated {new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white/60 text-stone-600 border-stone-300 text-xs">
              {blueprint.coverPage?.coachingType}
            </Badge>
            <Badge variant="outline" className="bg-white/60 text-violet-600 border-violet-200 text-xs">
              {mindsetWeeks} mindset weeks
            </Badge>
            <Badge variant="outline" className="bg-white/60 text-orange-600 border-orange-200 text-xs">
              {recipeCount} recipes
            </Badge>
          </div>
          <p className="text-sm italic text-stone-600">{blueprint.coverPage?.subtitle}</p>
          <ul className="text-sm text-stone-700 space-y-1 list-disc list-inside">
            {blueprint.executiveArchitecture?.mission && (
              <li><span className="font-medium">Mission:</span> {blueprint.executiveArchitecture.mission}</li>
            )}
            {blueprint.executiveArchitecture?.keyInsight && (
              <li><span className="font-medium">Key Insight:</span> {blueprint.executiveArchitecture.keyInsight}</li>
            )}
            {blueprint.executiveArchitecture?.identityShift && (
              <li><span className="font-medium">Identity Shift:</span> {blueprint.executiveArchitecture.identityShift}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function WellnessBlueprintViewer({
  blueprint,
  isAdmin = false,
  isApproved = false,
  isGenerating = false,
  onRegenerate,
  onApprove,
  onExportPDF,
}: WellnessBlueprintViewerProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Admin Controls Bar */}
      {isAdmin && (
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl border border-stone-200 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-2">
            {isApproved ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Approved & Shared
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                Draft — Review before sharing
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                disabled={isGenerating}
                className="text-violet-600 border-violet-200 hover:bg-violet-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                {isGenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            )}
            {onExportPDF && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPDF}
                className="text-stone-600"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export PDF
              </Button>
            )}
            {onApprove && !isApproved && (
              <Button
                size="sm"
                onClick={onApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Approve & Share
              </Button>
            )}
            {onApprove && isApproved && (
              <Button
                variant="outline"
                size="sm"
                onClick={onApprove}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit & Re-approve
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Summary Card */}
      <BlueprintSummaryCard blueprint={blueprint} />

      {/* Blueprint Content */}
      <div className="space-y-10">
        {/* Cover */}
        <CoverSection data={blueprint.coverPage} />

        {/* Executive Architecture */}
        <ExecutiveArchitectureSection data={blueprint.executiveArchitecture} />

        <Separator className="bg-amber-200/50" />

        {/* Mindset Roadmap */}
        <MindsetRoadmapSection data={blueprint.mindsetRoadmap} />

        <Separator className="bg-amber-200/50" />

        {/* Medical Pillar */}
        <MedicalPillarSection data={blueprint.medicalPillar} />

        <Separator className="bg-amber-200/50" />

        {/* Structural Integrity */}
        <StructuralIntegritySection data={blueprint.structuralIntegrity} />

        <Separator className="bg-amber-200/50" />

        {/* Equipment Audit */}
        <EquipmentAuditSection data={blueprint.equipmentAudit} />

        <Separator className="bg-amber-200/50" />

        {/* Nutrition Blueprint */}
        <NutritionBlueprintSection data={blueprint.nutritionBlueprint} />

        <Separator className="bg-amber-200/50" />

        {/* Recipe Cards */}
        <RecipeCardsSection data={blueprint.recipeCards} />

        {/* Footer */}
        <div className="text-center py-8">
          <div className="w-16 h-0.5 bg-amber-300/50 mx-auto mb-4" />
          <p className="text-xs text-stone-400 italic">
            Crafted with care by Zoe Modgill
          </p>
          <p className="text-[10px] text-stone-300 mt-1">
            The Boutique Wellness Blueprint
          </p>
        </div>
      </div>

      {/* Client-facing: Export PDF button at bottom */}
      {!isAdmin && onExportPDF && (
        <div className="flex justify-center mt-8">
          <Button onClick={onExportPDF} className="bg-stone-800 hover:bg-stone-900 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download My Blueprint (PDF)
          </Button>
        </div>
      )}
    </div>
  );
}
