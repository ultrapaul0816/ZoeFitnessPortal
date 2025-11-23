import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import NoteSection from "./NoteSection";

interface WhatComesNextSectionProps {
  userId: string;
  programId: string;
  progressEntries: Array<any>;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}

function WhatComesNextSection({ 
  userId, 
  programId, 
  progressEntries,
  canGoNext, 
  canGoPrevious, 
  navigateToNextTab, 
  navigateToPreviousTab,
  getNavigationText 
}: WhatComesNextSectionProps) {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const topics = [
    { id: 'how-to-know-ready', n: 1, title: 'Next Steps: How To Know You\'re Ready' },
    { id: 'red-flag-movements', n: 2, title: 'Red Flag Movements to Avoid' },
    { id: 'impact-readiness-test', n: 3, title: 'Return to Impact Readiness Test' },
    { id: 'progress-tracker', n: 4, title: 'Progress Tracker' },
    { id: 'yay-mama-you-did-it', n: 5, title: 'YAY MAMA...YOU DID IT!' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
          What's Next
        </h2>
        <p className="text-sm font-medium text-gray-600 border-l-4 border-indigo-400 pl-4 bg-gradient-to-r from-indigo-50 to-transparent py-2">
          Your roadmap for continued progress and empowerment
        </p>
      </div>

      <Card>
        <div className="p-6 space-y-1">
          {topics.map((topic, index) => (
            <div key={topic.id}>
              {index > 0 && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30 my-2"></div>
              )}
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">{topic.n}</span>
                  <h3 className="text-[15px] font-semibold text-left">{topic.title}</h3>
                </div>
                <div
                  onClick={() => toggleTopic(topic.id)}
                  className="w-8 h-8 min-w-[32px] min-h-[32px] bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200 flex-shrink-0"
                  style={{ border: 'none', outline: 'none', boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3)' }}
                  data-testid={`toggle-${topic.id}`}
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics[topic.id] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics[topic.id] && (
                <div className="pb-5 space-y-4" data-testid={`content-${topic.id}`}>
                  {topic.id === 'how-to-know-ready' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-4">NEXT STEPS: HOW TO KNOW YOU'RE <span className="text-pink-500">READY TO PROGRESS?</span></h3>
                        <p className="text-gray-700 leading-relaxed">
                          Once you've practiced your core connection work consistently and are no longer experiencing pressure, pain, or doming, you may be ready to move forward. Progression is not about how many reps you can do—but about how well your body responds and maintains function and control under load.
                        </p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-white border-2 rounded-lg overflow-hidden" style={{borderColor: '#cbde9a'}}>
                          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4">
                            <h4 className="font-bold text-gray-800 text-base">📊 Progress Indicators</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Progress Indicator</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">What It Means</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Less or no abdominal doming during movement</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">Your deep core is activating properly and controlling intra-abdominal pressure</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Ability to exhale and engage the core without holding your breath</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">You're breathing and bracing reflexively and safely</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">The gap between abs is narrower with improved midline tension</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">Your connective tissue is getting stronger and more supportive</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Noticeably better posture and reduced back or pelvic pain</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">Your core and pelvic floor are starting to stabilize your body again</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Daily movements like lifting your baby or standing up feel easier</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">You're regaining functional strength</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-white border-2 rounded-lg overflow-hidden" style={{borderColor: '#f3a8cb'}}>
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4">
                            <h4 className="font-bold text-pink-600 text-base">🔄 What to add next (progression ideas):</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">New Elements to Introduce</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">How to Do It Safely</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Resistance bands</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Start with light bands and include moves like glute bridges, squats, clamshells</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Functional core integration</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Engage core during squats, hip hinges, rows—exhale on effort</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Slightly higher reps</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Your connective tissue is getting stronger and more supportive</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Noticeably better posture and reduced back or pelvic pain</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Increase to 8–12 reps if no symptoms appear (doming, heaviness, leakage)</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Gentle dynamic movement</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Include controlled movements like wall push-ups, modified lunges, or step-ups</em></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-orange-500 mr-2 mt-1">⚡</span>
                            <span><strong>Remember:</strong> There's no rush. Listen to your body and progress at your own pace. Some women are ready in 6 weeks, others need 6 months. Both are perfectly normal.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : topic.id === 'red-flag-movements' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-4">RED FLAG <span className="text-pink-500">MOVEMENTS TO AVOID</span></h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            Even if you feel eager to get back into workouts, certain movements can delay healing and 
                            worsen core and pelvic floor dysfunction. These exercises increase intra-abdominal pressure, 
                            strain weak tissue, and risk injury if introduced too soon.
                          </p>
                          <p>
                            Avoid these until you've built a strong foundation of breath control, core engagement, and 
                            pelvic floor support—and have no signs of coning, bulging, or discomfort during movement.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white border-2 rounded-lg overflow-hidden" style={{borderColor: '#f2038b'}}>
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4">
                            <h4 className="font-bold text-red-600 text-base">🚫 Red Flag Movements</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Avoid These Movements</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Why They're Risky Postpartum</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Crunches or sit-ups</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Load the rectus abdominis too early, increasing pressure on the linea alba and worsening diastasis recti</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Front-loaded planks (high/low)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Put intense strain on the abdominal wall, often causing doming or bulging</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Twisting under load (e.g., Russian twists)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Involves forceful rotation on weakened tissue; can deepen separation</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Deep backbends or unsupported extensions</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Hyperextend the spine and stretch the healing core and pelvic floor</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Jumping, running, or impact exercises</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Increase pelvic floor pressure and can cause leaks, heaviness, or prolapse risk</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Any movement that causes doming, bulging, pain, or leakage</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>These are your body's signals to pause & regress the movement for now</em></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-orange-500 mr-2 mt-1">⚠️</span>
                            <span><strong>Remember:</strong> Your body will tell you when it's ready. Pay attention to these signals and prioritize healing over intensity. There's no rush—building a strong foundation now prevents setbacks later.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : topic.id === 'impact-readiness-test' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-4">🏃‍♀️ RETURN TO <span className="text-pink-500">IMPACT</span> READINESS TEST</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Not sure if you're ready for running, jumping, or HIIT? Use this self-check protocol to assess your 
                          core + pelvic floor readiness for high-impact movement.
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white border-2 rounded-lg overflow-hidden" style={{borderColor: '#f3a8cb'}}>
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4">
                            <h4 className="font-bold text-pink-600 text-base">🏃‍♀️ Impact Readiness Assessment</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 font-bold">TEST</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 font-bold">PASS CRITERIA</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">CORE BREATH ACTIVATION TEST</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Can exhale + engage without bearing down</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">SINGLE LEG STAND (30S PER LEG)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Stable, no wobbles, no pelvic symptoms</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">SINGLE LEG GLUTE BRIDGE (10 PER SIDE)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>No doming or pressure</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">FAST SIT-TO-STAND (10 REPS)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>No leaking or heaviness</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">FORWARD HOP (LANDING SOFT)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Core feels engaged, no pressure</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">JOG ON SPOT (30 SECONDS)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>No heaviness, pain, or leakage</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">JUMPING JACKS (10 REPS)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>No leaks, no bulging</em></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-amber-500 mr-2 mt-1">💡</span>
                            <span><strong>If you feel unsure, unstable, or symptomatic</strong> — revisit core drills, glute strength, and breathwork. You'll get there.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : topic.id === 'progress-tracker' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-4">✨ <span className="text-indigo-500">PROGRESS TRACKER</span> ✨</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Track your healing journey, week by week. Use this table to note your progress, symptoms, and small 
                          wins—because every step matters.
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="text-center">
                          <button
                            onClick={async () => {
                              try {
                                const jsPDF = await import('jspdf');
                                const doc = new jsPDF.jsPDF({
                                  orientation: 'landscape',
                                  unit: 'mm',
                                  format: 'a4'
                                });

                                doc.setFontSize(16);
                                doc.setFont('helvetica', 'bold');
                                doc.text('PROGRESS TRACKER', 148.5, 20, { align: 'center' });
                                
                                doc.setFontSize(10);
                                doc.setFont('helvetica', 'normal');
                                doc.text('Track your healing journey, week by week. Use this table to note your progress, symptoms, and small wins.', 148.5, 28, { align: 'center' });

                                const tableData = [
                                  ['WEEK', 'WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4', 'WEEK 5', 'WEEK 6'],
                                  ['DR GAP MEASUREMENT\n(Width/Depth at Navel, 2" Above, 2" Below)', '', '', '', '', '', ''],
                                  ['CORE CONNECTION\n(Scale 1-5)', '', '', '', '', '', ''],
                                  ['PELVIC FLOOR SYMPTOMS\n(Leaking, heaviness, bulging)', '', '', '', '', '', ''],
                                  ['POSTURE/BACK DISCOMFORT\n(Scale 1-5)', '', '', '', '', '', ''],
                                  ['ENERGY LEVEL\n(Scale 1-5)', '', '', '', '', '', ''],
                                  ['NUMBER OF WORKOUTS\nCompleted', '', '', '', '', '', ''],
                                  ['NOTES OR WINS\nFor the week', '', '', '', '', '', '']
                                ];

                                const startX = 10;
                                const startY = 40;
                                const rowHeight = 15;
                                const colWidths = [60, 36, 36, 36, 36, 36, 36];

                                for (let i = 0; i < tableData.length; i++) {
                                  const y = startY + (i * rowHeight);
                                  let currentX = startX;

                                  for (let j = 0; j < tableData[i].length; j++) {
                                    const width = colWidths[j];
                                    
                                    if (i === 0) {
                                      if (j === 0) {
                                        doc.setFillColor(200, 200, 200);
                                      } else {
                                        doc.setFillColor(242, 3, 139);
                                      }
                                      doc.rect(currentX, y, width, rowHeight, 'F');
                                    } else if (j === 0) {
                                      doc.setFillColor(230, 230, 230);
                                      doc.rect(currentX, y, width, rowHeight, 'F');
                                    }

                                    doc.setDrawColor(0);
                                    doc.rect(currentX, y, width, rowHeight);

                                    if (tableData[i][j]) {
                                      doc.setTextColor(i === 0 && j > 0 ? 255 : 0);
                                      doc.setFontSize(i === 0 ? 9 : 8);
                                      doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
                                      
                                      const lines = tableData[i][j].split('\n');
                                      const lineHeight = 4;
                                      const textStartY = y + (rowHeight / 2) - ((lines.length - 1) * lineHeight / 2) + 2;
                                      
                                      lines.forEach((line, lineIndex) => {
                                        doc.text(line, currentX + 2, textStartY + (lineIndex * lineHeight), { maxWidth: width - 4 });
                                      });
                                    }

                                    currentX += width;
                                  }
                                }

                                doc.setTextColor(0);
                                doc.setFontSize(9);
                                doc.setFont('helvetica', 'italic');
                                doc.text('Printing Tip: Print in landscape mode for best results. Fill out by hand weekly.', startX, startY + (tableData.length * rowHeight) + 10);

                                doc.save('Progress-Tracker-Postpartum-Recovery.pdf');
                              } catch (error) {
                                console.error('PDF Error:', error);
                                alert('Error creating PDF. Please try again or contact support.');
                              }
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            data-testid="button-download-tracker"
                          >
                            📥 Download Printable Tracker
                          </button>
                        </div>

                        <div id="progress-tracker-table" className="bg-white p-6 rounded-lg border-2" style={{borderColor: '#9aafdc'}}>
                          <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-3">
                              ✨ PROGRESS TRACKER ✨
                            </h2>
                            <p className="text-gray-700 text-sm">
                              Track your healing journey, week by week. Use this table to note your progress, symptoms, and small wins—because every step matters.
                            </p>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-400">
                              <thead>
                                <tr>
                                  <th className="border border-gray-400 bg-gray-200 p-3 text-center font-bold text-gray-700" style={{width: '20%'}}>
                                    WEEK
                                  </th>
                                  {['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4', 'WEEK 5', 'WEEK 6'].map((week) => (
                                    <th key={week} className="border border-gray-400 bg-pink-100 p-3 text-center font-bold text-pink-600 transform -rotate-90" style={{width: '13.33%', height: '80px'}}>
                                      <div className="whitespace-nowrap">{week}</div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { label: 'DR GAP\nMEASUREMENT', sub: '(Width/Depth at Navel,\n2" Above, 2" Below)' },
                                  { label: 'CORE\nCONNECTION', sub: '(Scale 1-5)' },
                                  { label: 'PELVIC FLOOR\nSYMPTOMS', sub: '(Leaking, heaviness,\nbulging)' },
                                  { label: 'POSTURE/BACK\nDISCOMFORT', sub: '(Scale 1-5)' },
                                  { label: 'ENERGY LEVEL', sub: '(Scale 1-5)' },
                                  { label: 'NUMBER OF\nWORKOUTS', sub: 'Completed' },
                                  { label: 'NOTES OR WINS', sub: 'For the week' }
                                ].map((row, idx) => (
                                  <tr key={idx}>
                                    <td className="border border-gray-400 bg-gray-200 p-3 font-bold text-center text-xs">
                                      {row.label.split('\n').map((line, i) => (
                                        <div key={i}>{line}</div>
                                      ))}
                                      {row.sub && row.sub.split('\n').map((line, i) => (
                                        <div key={i} className="font-normal italic mt-1">{line}</div>
                                      ))}
                                    </td>
                                    {[1, 2, 3, 4, 5, 6].map((week) => (
                                      <td key={week} className="border border-gray-400 p-8 bg-gray-50"></td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-amber-500 mr-2 mt-1">💡</span>
                            <span><strong>Printing Tip:</strong> After downloading, print in landscape mode for the best fit. This tracker is designed to be filled out by hand for convenient weekly tracking.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : topic.id === 'yay-mama-you-did-it' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-4">YAY MAMA...YOU DID IT!</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            A moment to pause, reflect, and honour the strength you've rebuilt—inside and out. 
                            This isn't just the end of a program. It's the beginning of a stronger, more connected you.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white border-2 rounded-lg p-6" style={{borderColor: '#f3a8cb'}}>
                          <div className="mb-4">
                            <h4 className="font-bold text-pink-500 text-lg mb-4">⭐ TAKE A MOMENT TO REFLECT</h4>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <div>
                                <strong className="font-semibold">What's changed in your body?</strong>
                                <div className="text-gray-600 italic mt-1">
                                  Maybe you stand taller, breathe deeper, or feel more supported in your core.
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <div>
                                <strong className="font-semibold">What's changed in your mindset?</strong>
                                <div className="text-gray-600 italic mt-1">
                                  Maybe you've let go of pressure to "bounce back" and instead learned how to tune in.
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <div>
                                <strong className="font-semibold">What's something you're proud of?</strong>
                                <div className="text-gray-600 italic mt-1">
                                  Even showing up once a week is worth celebrating. Progress looks different for everyone.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <NoteSection userId={userId} programId="b03be40d-290e-4c96-bbb4-0267371c8024" />

                        <div className="bg-white border-2 rounded-lg p-6" style={{borderColor: '#f3a8cb'}}>
                          <h4 className="font-bold text-pink-500 text-lg mb-4">WHAT COMES NEXT?</h4>
                          <p className="text-gray-700 mb-4">If you feel:</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <span>Stronger and more stable</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <span>Free from symptoms like doming or leaking</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <span>Ready for more challenge and variety</span>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">
                            Then you should be ready to move into a strength training phase, or a return-to-impact program. 
                            But, if still healing? You can repeat this program again—or stay in your favourite phase a little 
                            longer. <strong>CELEBRATE YOUR WINS</strong> - Whether you finished every session or simply showed up 
                            when you could—That. Is. Enough.
                          </p>
                          
                          <div className="text-center mt-6">
                            <p className="text-lg text-pink-600 font-medium">Love Zoe 💕</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Continue Your Journey</h3>
          <p className="text-sm text-gray-600">Navigate through your recovery program</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
          {canGoPrevious() && (
            <Button
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-previous-section-next-steps"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              {getNavigationText('prev')}
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-next-section-next-steps"
              onClick={navigateToNextTab}
            >
              {getNavigationText('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Get answers to common questions</p>
        </div>
      </div>
    </div>
  );
}

export default WhatComesNextSection;
