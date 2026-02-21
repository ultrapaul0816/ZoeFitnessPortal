import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronLeft, Play } from "lucide-react";
import { VideoModal } from "@/components/video-modal";
import diastasisAnatomyImage from "@assets/Screenshot 2025-09-21 at 15.38.53_1758449353065.png";
import diastasisVariationsImage from "@assets/Screenshot 2025-09-21 at 15.39.02_1758449353058.png";
import diastasisCheckImage from "@assets/Screenshot 2025-09-21 at 15.56.11_1758450385583.png";
import coreRehabExerciseImage from "@assets/Screenshot 2025-09-21 at 15.57.47_1758450479618.png";
import pressureManagementImage from "@assets/Screenshot 2025-09-21 at 16.35.50_1758452773516.png";
import breathCoordinationImage from "@assets/Screenshot 2025-09-21 at 16.36.02_1758452773500.png";
import tvaContentImage from "@assets/Screenshot 2025-09-21 at 14.38.24_1758445791011.png";
import pelvicFloorImage from "@assets/Screenshot 2025-09-21 at 14.54.10_1758446664540.png";

interface NavigationProps {
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}

export default function HealSection({ canGoNext, canGoPrevious, navigateToNextTab, navigateToPreviousTab, getNavigationText }: NavigationProps) {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [videoPopup, setVideoPopup] = useState<{url: string, title: string} | null>(null);

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const topics = [
    { id: 'what-is-diastasis', n: 1, title: 'What Is Diastasis' },
    { id: 'do-i-have-diastasis', n: 2, title: 'Do I Have Diastasis Recti' },
    { id: 'why-core-rehab-matters', n: 3, title: 'Why Core Rehab Matters' },
    { id: 'why-crunches-wont-work', n: 4, title: "Why Crunches Won't Work" },
    { id: 'core-rehab-daily-practice', n: 5, title: 'Core Rehab & Daily Practice' },
    { id: 'week-by-week-reconnection', n: 6, title: 'Rehab Routine – Week-by-Week Reconnection' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-left">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
            Heal
          </CardTitle>
          <CardDescription className="text-sm font-medium text-gray-600 border-l-4 border-emerald-400 pl-4 bg-gradient-to-r from-emerald-50 to-transparent py-2">
            Understanding diastasis recti and beginning your core rehabilitation journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
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
                    {topic.id === 'what-is-diastasis' ? (
                      <div className="space-y-4 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-2">WHAT IS <span className="text-pink-500">DIASTASIS RECTI</span></h3>
                        </div>
                        
                        <div className="flex justify-center my-4">
                          <img 
                            src={diastasisAnatomyImage} 
                            alt="Normal abdomen vs diastasis recti anatomy diagram" 
                            className="max-w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>
                        
                        <p>
                          <strong className="text-pink-500">Diastasis recti (DR)</strong> is a natural separation of the abdominal muscles along the midline (Linea alba) during pregnancy to make room for your growing baby.
                        </p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold mb-2 text-gray-800">After birth, for many women:</p>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>✤ The separation may not fully close</li>
                            <li>✤ The connective tissue may remain weak or overstretched</li>
                            <li>✤ A feeling of "coning" or doming down the midline during effort</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Variations of Diastasis Recti</h4>
                          
                          <div className="flex justify-center my-3">
                            <img 
                              src={diastasisVariationsImage} 
                              alt="Variations of diastasis recti diagram showing different types" 
                              className="max-w-full h-auto rounded-lg shadow-sm"
                            />
                          </div>
                          
                          <p className="text-xs mb-2">Diastasis can occur in different areas of the abdomen:</p>
                          <ul className="text-xs space-y-1">
                            <li>• <strong>Abdomen without diastasis</strong> - Normal separation</li>
                            <li>• <strong>Diastasis around umbilicus</strong> - Around belly button area</li>
                            <li>• <strong>Below umbilicus diastasis</strong> - Lower abdominal area</li>
                            <li>• <strong>Above umbilicus diastasis</strong> - Upper abdominal area</li>
                            <li>• <strong>Diastasis along full length of linea alba</strong> - Complete separation</li>
                          </ul>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="font-semibold mb-2">Common symptoms include:</p>
                          <ul className="space-y-1 text-xs">
                            <li>✤ A visible gap or bulge along the belly</li>
                            <li>✤ Poor core connection or feeling "weak in the middle"</li>
                            <li>✤ Back pain, pelvic instability, or pelvic floor symptoms</li>
                          </ul>
                        </div>
                        
                        <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                          <p className="text-pink-700 font-medium mb-1">
                            DR is common, treatable, and not your fault.
                          </p>
                          <p className="text-xs text-pink-600">
                            With proper rehab, many see significant improvement in both function and appearance.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-sm font-medium text-green-800">
                            Even if you don't have a visible gap, you can still benefit from this program.
                          </p>
                        </div>
                      </div>
                    ) : topic.id === 'do-i-have-diastasis' ? (
                      <div className="space-y-4 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4"><span className="text-purple-400">DO I HAVE</span> DIASTASIS RECTI?</h3>
                        </div>
                        
                        <div className="flex justify-start mb-4">
                          <button 
                            onClick={() => setVideoPopup({ url: 'https://youtu.be/zgU0svFSNRE', title: 'How to Check for Diastasis Recti' })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
                            style={{
                              background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                              boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3)'
                            }}
                          >
                            <Play className="w-3 h-3" />
                            HOW TO CHECK FOR DIASTASIS RECTI
                          </button>
                        </div>
                        
                        <div className="flex justify-center my-4">
                          <img 
                            src={diastasisCheckImage} 
                            alt="How to check for diastasis recti - demonstration image" 
                            className="max-w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-green-200">
                          <p className="font-semibold text-blue-800 mb-3">Lie on your back, knees bent, feet flat on the floor. Get comfortable & breathe naturally.</p>
                          <p className="text-sm text-blue-700 mb-3">Place one hand behind your head, and the other hand across your belly, with your fingers pointing down toward your navel. Make sure your fingers are together (not spread wide).</p>
                          
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">1.</span>
                              <p className="text-blue-700">Press your fingertips gently into your belly, just above your belly button. This is where we'll check the depth and width of any separation.</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">2.</span>
                              <p className="text-blue-700">Exhale & slowly lift your head & shoulders off the floor (just a small lift - around 2-3 inches). You should feel the two sides of your abdominal wall moving toward each other.</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">3.</span>
                              <p className="text-blue-700">Count how many fingers fit into the gap between your abdominal walls at the navel.</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">4.</span>
                              <p className="text-blue-700">Move your fingers above and below the belly button (around 2 inches in each direction) and repeat the lift to feel if the gap is larger or smaller there.</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">5.</span>
                              <p className="text-blue-700">Now test the tissue. As you do your fingers sink into your abdomen?</p>
                            </div>
                            
                            <div className="space-y-1 mt-3">
                              <p className="text-blue-700">❖ Does the tissue feel firm and springy (good tension)?</p>
                              <p className="text-blue-700">❖ Or soft, deep, and hard to engage (poor tension)?</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                          <p className="font-bold text-pink-700 mb-2">Sample result: <em>"2 fingers at the navel, 2 above, 1 below with moderate depth"</em></p>
                          <p className="text-pink-600 text-sm">This is helpful to note so you can track changes as the program progresses.</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                          <p className="font-semibold text-gray-800 mb-2">Disclaimer:</p>
                          <p className="text-xs text-gray-700">If you notice a very large gap (more than 4 fingers), significant abdominal bulging, persistent pain, or feelings of instability in your core, back, or pelvis, this program alone may not be enough. Please consult a women's health physiotherapist or qualified healthcare provider before continuing. Your safety and long-term recovery come first.</p>
                        </div>
                      </div>
                    ) : topic.id === 'why-core-rehab-matters' ? (
                      <div className="space-y-4 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4"><span className="text-pink-500">WHY CORE</span> REHAB MATTERS</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                          Even without visible DR, your core may feel disconnected, weak, or uncoordinated. That's where core rehab comes in. This isn't just about workouts—it's about making your core functional again for everything from lifting your baby to carrying groceries. The best part? You're retraining your whole body, not just your abs. <strong className="text-pink-500">IT'S NEVER TOO LATE TO HEAL ✨</strong> The core is trainable at any stage, and you are worthy of that healing. There's no expiration date on recovery. Let's start where you are.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                              <h4 className="font-bold text-pink-700 mb-3">Whether you're:</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600">❖</span>
                                  <span>6 weeks postpartum</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600">❖</span>
                                  <span>6 months into motherhood</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600">❖</span>
                                  <span>Or even 6 years down the line</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                              <h4 className="font-bold text-blue-700 mb-3">As you continue through the program, we'll work to:</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Reduce the gap width (if present)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Improve tension & strength in the connective tissue</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Enhance coordination between breath, core, and pelvic floor</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-center mb-4">
                              <img 
                                src={coreRehabExerciseImage} 
                                alt="Woman demonstrating core exercise technique with small ball" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                              <h4 className="font-bold text-green-700 mb-3">Rebuilding your core helps you:</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Restore strength and stability</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Prevent pain or injury</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Improve posture and breathing</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Reduce pelvic floor symptoms</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Feel more confident and connected</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                              <h4 className="font-bold text-purple-700 mb-3">Many women see noticeable improvement in:</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Core connection</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Diastasis recti</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Pelvic floor symptoms</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Strength and balance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Confidence and energy</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : topic.id === 'why-crunches-wont-work' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4">WHY CRUNCHES <span className="text-gray-400">WON'T WORK</span></h3>
                        </div>

                        <p className="text-gray-700 mb-6">
                          Crunches and sit-ups increase intra-abdominal pressure, which pushes outward against the separation—further stretching the Linea alba instead of healing it. These exercises load the abdominal wall before it's ready, worsening doming, coning, and core dysfunction.
                        </p>


                        <div className="text-center mb-6">
                          <h4 className="font-bold text-blue-800 text-lg mb-2">THE FOCUS NEEDS TO BE ON:</h4>
                          <div className="flex justify-center">
                            <div className="text-green-600 text-2xl">▼</div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-6">
                          <div className="bg-blue-50 border border-green-200 rounded-lg p-6 space-y-4">
                            <div>
                              <h5 className="font-bold text-green-600 text-lg mb-3">1. Pressure Management</h5>
                              <p className="text-sm text-gray-700 mb-4">
                                Understanding how pressure moves through the core during breath, lifting, or movement. The goal is to avoid excess intra-abdominal pressure by coordinating breath and posture.
                              </p>
                            </div>
                            
                            <div className="flex justify-center">
                              <img 
                                src={pressureManagementImage} 
                                alt="Pressure management exercise demonstration" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                            <div>
                              <h5 className="font-bold text-green-600 text-lg mb-3">2. Breath Coordination</h5>
                              <p className="text-sm text-gray-700 mb-4">
                                Practice 360° breathing where your ribs, belly, and back all expand on the inhale, and gently draw in and up on the exhale. This restores natural core function and reconnects the pelvic floor and TVA.
                              </p>
                            </div>
                            
                            <div className="flex justify-center">
                              <img 
                                src={breathCoordinationImage} 
                                alt="Breath coordination exercise demonstration" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          </div>

                          <div className="bg-purple-50 border border-green-200 rounded-lg p-6 space-y-4">
                            <div>
                              <h5 className="font-bold text-purple-600 text-lg mb-3">3. TVA Activation</h5>
                              <p className="text-sm text-gray-700">
                                Activate your transverse abdominis (TVA)—the deepest abdominal layer—to create internal tension and support your midline without crunching. This is what holds everything together.
                              </p>
                            </div>
                            
                            <div className="flex justify-center">
                              <img 
                                src={tvaContentImage} 
                                alt="TVA activation exercise demonstration" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          </div>

                          <div className="bg-teal-50 border border-green-200 rounded-lg p-6 space-y-4">
                            <div>
                              <h5 className="font-bold text-teal-600 text-lg mb-3">4. Pelvic Floor Connection</h5>
                              <p className="text-sm text-gray-700">
                                Your pelvic floor works in tandem with your core. Gentle pelvic floor engagement on the exhale stabilizes your entire canister.
                              </p>
                            </div>
                            
                            <div className="flex justify-center">
                              <img 
                                src={pelvicFloorImage} 
                                alt="Pelvic floor connection exercise demonstration" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg border-l-4 border-pink-400">
                          <p className="text-gray-700 leading-relaxed">
                            <strong className="text-pink-600">When these four pieces work together,</strong> you begin to rebuild a functional core that supports movement, strength, and healing—without crunching or pushing outward.
                          </p>
                        </div>
                      </div>
                    ) : topic.id === 'core-rehab-daily-practice' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4">CORE REHAB & <span className="text-pink-500">DAILY PRACTICE</span></h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                          Rehab doesn't always mean formal workouts. It can also mean practicing your core connection during daily movements—like lifting your baby, getting out of bed, or doing laundry. This is how you turn exercises into habits that stick.
                        </p>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
                          <h4 className="font-bold text-blue-700 mb-4">Before You Start Any Movement:</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">1.</span>
                              <span><strong>Inhale</strong> through your nose (360° breath)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">2.</span>
                              <span><strong>Exhale</strong> and gently engage your core (TVA) and pelvic floor</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">3.</span>
                              <span><strong>Move</strong> while maintaining that gentle tension</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border border-green-200">
                          <h4 className="font-bold text-green-700 mb-4">Daily Opportunities to Practice:</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-green-600">❖</span>
                              <span><strong>Lifting your baby:</strong> Exhale as you pick them up</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600">❖</span>
                              <span><strong>Getting out of bed:</strong> Roll to your side, exhale as you push up</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600">❖</span>
                              <span><strong>Sitting to standing:</strong> Engage your core before you rise</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600">❖</span>
                              <span><strong>Carrying groceries:</strong> Keep your ribs stacked, core engaged</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed">
                            <strong className="text-orange-600">Remember:</strong> Your core is always on. The more you practice engaging it reflexively during daily tasks, the stronger and more connected it becomes.
                          </p>
                        </div>
                      </div>
                    ) : topic.id === 'week-by-week-reconnection' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4">REHAB ROUTINE – <span className="text-pink-500">WEEK-BY-WEEK RECONNECTION</span></h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                          This is a gentle, progressive roadmap designed to rebuild your core connection. Each week builds on the previous one, adding complexity only when your body is ready.
                        </p>

                        <div className="space-y-4">
                          <div className="bg-white border-2 border-pink-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-4">
                              <h4 className="font-bold text-pink-700">Week 1-2: Foundation & Breath</h4>
                            </div>
                            <div className="p-4">
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-500">•</span>
                                  <span>Practice 360° breathing daily (5-10 minutes)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-500">•</span>
                                  <span>Gentle pelvic floor lifts with breath</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-500">•</span>
                                  <span>TVA engagement practice (lying down, seated)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-500">•</span>
                                  <span>Check for doming during movements</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="bg-white border-2 border-blue-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4">
                              <h4 className="font-bold text-blue-700">Week 3-4: Adding Movement</h4>
                            </div>
                            <div className="p-4">
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-500">•</span>
                                  <span>Continue breath + TVA work</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-500">•</span>
                                  <span>Add gentle glute bridges (single and double leg)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-500">•</span>
                                  <span>Dead bugs with breath coordination</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-500">•</span>
                                  <span>Side-lying exercises for obliques</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="bg-white border-2 border-purple-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-100 to-violet-100 p-4">
                              <h4 className="font-bold text-purple-700">Week 5-6: Building Strength</h4>
                            </div>
                            <div className="p-4">
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-500">•</span>
                                  <span>Progress to more dynamic movements</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-500">•</span>
                                  <span>Modified planks (incline, knee variations)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-500">•</span>
                                  <span>Functional movements (squats, lunges with core engagement)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-500">•</span>
                                  <span>Increase reps gradually, always monitoring for symptoms</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed">
                            <strong className="text-green-600">Progress at your own pace.</strong> If you notice doming, bulging, pain, or discomfort, regress the movement and focus on breath and connection first. There's no rush—healing is not linear.
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
        <div className="flex gap-4 w-full sm:w-auto">
          {canGoPrevious() && (
            <Button
              variant="outline"
              className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:text-pink-700 px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full transition-all duration-300 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-prev-section-heal"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              {getNavigationText('prev')}
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-next-section-heal"
              onClick={navigateToNextTab}
            >
              {getNavigationText('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Progress through your personalized recovery journey</p>
        </div>
      </div>
      {videoPopup && (
        <VideoModal
          isOpen={true}
          onClose={() => setVideoPopup(null)}
          videoUrl={videoPopup.url}
          title={videoPopup.title}
        />
      )}
    </div>
  );
}
