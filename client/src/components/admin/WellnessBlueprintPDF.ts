import type { BlueprintData, BlueprintRecipeCard, EquipmentItem } from "./WellnessBlueprintTypes";

// Color palette for the PDF (RGB values)
const COLORS = {
  cream: [250, 248, 243] as [number, number, number],
  warmGray: [120, 113, 108] as [number, number, number],
  stone800: [41, 37, 36] as [number, number, number],
  stone600: [87, 83, 78] as [number, number, number],
  stone400: [168, 162, 158] as [number, number, number],
  amber400: [251, 191, 36] as [number, number, number],
  amber600: [217, 119, 6] as [number, number, number],
  amber100: [254, 243, 199] as [number, number, number],
  rose50: [255, 241, 242] as [number, number, number],
  rose600: [225, 29, 72] as [number, number, number],
  emerald50: [236, 253, 245] as [number, number, number],
  emerald600: [5, 150, 105] as [number, number, number],
  sky50: [240, 249, 255] as [number, number, number],
  sky600: [2, 132, 199] as [number, number, number],
  violet50: [245, 243, 255] as [number, number, number],
  violet600: [124, 58, 237] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export async function generateBlueprintPDF(blueprint: BlueprintData, clientName: string): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ===== Helper Functions =====
  function addCreamBackground() {
    doc.setFillColor(...COLORS.cream);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  }

  function checkNewPage(neededHeight: number) {
    if (y + neededHeight > pageHeight - 25) {
      doc.addPage();
      addCreamBackground();
      addFooter();
      y = margin;
    }
  }

  function addFooter() {
    doc.setFontSize(7);
    doc.setFont("times", "italic");
    doc.setTextColor(...COLORS.stone400);
    doc.text("The Boutique Wellness Blueprint", margin, pageHeight - 10);
    doc.text(`Crafted by Zoe Modgill`, pageWidth - margin, pageHeight - 10, { align: "right" });
    const pageNum = doc.getNumberOfPages();
    doc.text(`${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  function addSectionTitle(title: string, subtitle?: string) {
    checkNewPage(20);
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.stone800);
    doc.text(title, margin, y);
    y += 6;

    if (subtitle) {
      doc.setFont("times", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.stone400);
      doc.text(subtitle, margin, y);
      y += 5;
    }

    // Accent line
    doc.setDrawColor(...COLORS.amber400);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 30, y);
    y += 8;
  }

  function addParagraph(text: string, fontSize: number = 10, color: [number, number, number] = COLORS.stone600) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    checkNewPage(lines.length * (fontSize * 0.45) + 4);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.45) + 4;
  }

  function addBulletPoint(text: string, indent: number = 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.stone600);
    const bulletX = margin + indent;
    const textX = bulletX + 4;
    const lines = doc.splitTextToSize(text, contentWidth - indent - 4);
    checkNewPage(lines.length * 4 + 2);

    doc.setFillColor(...COLORS.amber400);
    doc.circle(bulletX + 1, y - 1, 0.8, "F");
    doc.text(lines, textX, y);
    y += lines.length * 4 + 2;
  }

  // ===== PAGE 1: COVER =====
  addCreamBackground();

  // Decorative top line
  doc.setDrawColor(...COLORS.amber400);
  doc.setLineWidth(0.8);
  doc.line(margin, 40, pageWidth - margin, 40);

  // Title
  y = 80;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.amber600);
  doc.text("THE BOUTIQUE WELLNESS BLUEPRINT", pageWidth / 2, y, { align: "center" });

  y = 110;
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.setTextColor(...COLORS.stone800);
  const nameLines = doc.splitTextToSize(blueprint.coverPage.clientName, contentWidth);
  doc.text(nameLines, pageWidth / 2, y, { align: "center" });

  y = 130;
  doc.setDrawColor(...COLORS.amber400);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 20, y, pageWidth / 2 + 20, y);

  y = 145;
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.stone600);
  const subtitleLines = doc.splitTextToSize(blueprint.coverPage.subtitle, contentWidth - 20);
  doc.text(subtitleLines, pageWidth / 2, y, { align: "center" });

  y = 175;
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.stone400);
  doc.text(blueprint.coverPage.tagline, pageWidth / 2, y, { align: "center" });

  y = 185;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(blueprint.coverPage.coachingType, pageWidth / 2, y, { align: "center" });

  // Decorative bottom line
  doc.setDrawColor(...COLORS.amber400);
  doc.setLineWidth(0.8);
  doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);

  addFooter();

  // ===== PAGE 2: EXECUTIVE ARCHITECTURE =====
  doc.addPage();
  addCreamBackground();
  addFooter();
  y = margin;

  addSectionTitle("Executive Performance Architecture", "Your strategic transformation compass");

  // Mission
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Mission", margin, y);
  y += 6;
  addParagraph(blueprint.executiveArchitecture.mission);
  y += 3;

  // Identity Shift
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Identity Shift", margin, y);
  y += 6;
  addParagraph(blueprint.executiveArchitecture.identityShift);
  y += 3;

  // Key Insight
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Key Insight", margin, y);
  y += 6;
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.amber600);
  const insightLines = doc.splitTextToSize(`"${blueprint.executiveArchitecture.keyInsight}"`, contentWidth);
  doc.text(insightLines, margin, y);
  y += insightLines.length * 5 + 8;

  // ===== MINDSET ROADMAP =====
  addSectionTitle("Phase 1: 4-Week Mindset Roadmap", "Your psychological transformation journey");

  const mindsetWeeks = [
    { label: "Week 1", data: blueprint.mindsetRoadmap.week1 },
    { label: "Week 2", data: blueprint.mindsetRoadmap.week2 },
    { label: "Week 3", data: blueprint.mindsetRoadmap.week3 },
    { label: "Week 4", data: blueprint.mindsetRoadmap.week4 },
  ];

  for (const mw of mindsetWeeks) {
    checkNewPage(30);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.stone800);
    doc.text(`${mw.label}: ${mw.data.theme}`, margin, y);
    y += 5;
    addParagraph(mw.data.focus, 9);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.amber600);
    const actionLines = doc.splitTextToSize(`Action: ${mw.data.actionItem}`, contentWidth - 5);
    doc.text(actionLines, margin + 5, y);
    y += actionLines.length * 3.5 + 5;
  }

  // ===== MEDICAL PILLAR =====
  doc.addPage();
  addCreamBackground();
  addFooter();
  y = margin;

  addSectionTitle("Phase 2: Hormonal & Medical Pillar", "Your health-optimized foundation");
  addParagraph(blueprint.medicalPillar.overview);
  y += 3;

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Health Considerations", margin, y);
  y += 5;
  for (const item of blueprint.medicalPillar.considerations) {
    addBulletPoint(item);
  }
  y += 3;

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Smart Adaptations", margin, y);
  y += 5;
  for (const item of blueprint.medicalPillar.adaptations) {
    addBulletPoint(item);
  }
  y += 3;

  if (blueprint.medicalPillar.doctorClearance) {
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.emerald600);
    doc.text("Doctor Clearance:", margin, y);
    y += 4;
    addParagraph(blueprint.medicalPillar.doctorClearance, 9);
  }

  // ===== STRUCTURAL INTEGRITY =====
  y += 5;
  addSectionTitle(`Structural Integrity: ${blueprint.structuralIntegrity.title}`, "Your body-smart movement strategy");

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Primary Focus Areas", margin, y);
  y += 5;
  blueprint.structuralIntegrity.primaryConcerns.forEach((item, i) => {
    checkNewPage(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.stone600);
    const lines = doc.splitTextToSize(`${i + 1}. ${item}`, contentWidth - 5);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4 + 2;
  });
  y += 3;

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emerald600);
  doc.text("Protocols", margin, y);
  y += 5;
  for (const item of blueprint.structuralIntegrity.protocols) {
    addBulletPoint(item);
  }
  y += 3;

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Movements to Embrace", margin, y);
  y += 5;
  for (const item of blueprint.structuralIntegrity.whatToEmbrace) {
    addBulletPoint(item);
  }
  y += 3;

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.rose600);
  checkNewPage(8);
  doc.text("Mindful Boundaries", margin, y);
  y += 5;
  for (const item of blueprint.structuralIntegrity.whatToAvoid) {
    addBulletPoint(item);
  }

  // ===== EQUIPMENT AUDIT =====
  doc.addPage();
  addCreamBackground();
  addFooter();
  y = margin;

  addSectionTitle("Asset Class: Elite Equipment Audit", "Your training toolkit");
  addParagraph(blueprint.equipmentAudit.overview);
  y += 3;

  for (const item of blueprint.equipmentAudit.essentialEquipment) {
    checkNewPage(14);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.stone800);
    doc.text(`${item.name}`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.amber600);
    doc.text(`[${item.category}]`, margin + doc.getTextWidth(item.name) + 3, y);
    y += 4;
    addParagraph(item.purpose, 9);
    y += 1;
  }

  if (blueprint.equipmentAudit.recommendations.length > 0) {
    y += 3;
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.stone800);
    doc.text("Recommendations", margin, y);
    y += 5;
    for (const rec of blueprint.equipmentAudit.recommendations) {
      addBulletPoint(rec);
    }
  }

  // ===== NUTRITION BLUEPRINT =====
  y += 8;
  addSectionTitle("Nutrition Blueprint: Philosophy & Rituals", "Your fuel strategy");

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.amber600);
  const philLines = doc.splitTextToSize(`"${blueprint.nutritionBlueprint.philosophy}"`, contentWidth);
  checkNewPage(philLines.length * 5 + 10);
  doc.text(philLines, margin, y);
  y += philLines.length * 5 + 6;

  // Daily targets
  checkNewPage(15);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Daily Targets", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.stone600);
  doc.text(`Calories: ${blueprint.nutritionBlueprint.dailyTargets.calories}  |  Protein: ${blueprint.nutritionBlueprint.dailyTargets.protein}  |  Hydration: ${blueprint.nutritionBlueprint.dailyTargets.hydration}`, margin, y);
  y += 8;

  // Core Tenets
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.stone800);
  doc.text("Core Tenets", margin, y);
  y += 5;
  blueprint.nutritionBlueprint.coreTenets.forEach((tenet, i) => {
    checkNewPage(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.stone800);
    doc.text(`${i + 1}. ${tenet.tenet}`, margin + 3, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.stone600);
    const explLines = doc.splitTextToSize(tenet.explanation, contentWidth - 8);
    doc.text(explLines, margin + 6, y);
    y += explLines.length * 3.5 + 3;
  });

  // Restrictions
  if (blueprint.nutritionBlueprint.restrictions.length > 0) {
    y += 3;
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.rose600);
    doc.text("Dietary Notes: " + blueprint.nutritionBlueprint.restrictions.join(", "), margin, y);
    y += 6;
  }

  // ===== RECIPE CARDS =====
  doc.addPage();
  addCreamBackground();
  addFooter();
  y = margin;

  addSectionTitle("Signature Recipe Cards", "Personalized meals for your journey");

  for (const recipe of blueprint.recipeCards) {
    checkNewPage(55);

    // Recipe box
    doc.setDrawColor(...COLORS.amber400);
    doc.setLineWidth(0.3);
    const boxY = y - 2;

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.stone800);
    doc.text(recipe.name, margin + 3, y + 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.amber600);
    doc.text(`${recipe.mealType.toUpperCase()}  |  ${recipe.prepTime}`, margin + 3, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.stone400);
    doc.text(recipe.tagline, margin + 3, y + 11);
    y += 14;

    // Why it works
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.stone600);
    const whyLines = doc.splitTextToSize(recipe.whyItWorks, contentWidth - 6);
    doc.text(whyLines, margin + 3, y);
    y += whyLines.length * 3.5 + 3;

    // Macros
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.stone800);
    doc.text(`${recipe.macros.calories} cal  |  P: ${recipe.macros.protein}  |  C: ${recipe.macros.carbs}  |  F: ${recipe.macros.fat}`, margin + 3, y);
    y += 5;

    // Ingredients
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.stone800);
    doc.text("Ingredients:", margin + 3, y);
    y += 3.5;
    for (const ing of recipe.ingredients) {
      checkNewPage(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.stone600);
      doc.text(`- ${ing}`, margin + 6, y);
      y += 3.5;
    }
    y += 2;

    // Instructions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.stone800);
    checkNewPage(10);
    doc.text("Instructions:", margin + 3, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.stone600);
    const instrLines = doc.splitTextToSize(recipe.instructions, contentWidth - 10);
    checkNewPage(instrLines.length * 3.5 + 5);
    doc.text(instrLines, margin + 6, y);
    y += instrLines.length * 3.5 + 3;

    // Border around recipe
    const boxHeight = y - boxY + 2;
    doc.roundedRect(margin, boxY, contentWidth, boxHeight, 2, 2);
    y += 8;
  }

  // ===== SAVE =====
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, "-");
  doc.save(`${safeName}-Wellness-Blueprint.pdf`);
}
