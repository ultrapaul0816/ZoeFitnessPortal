import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronLeft, Play } from "lucide-react";
import anatomyImage from "@assets/Screenshot 2025-09-21 at 14.30.34_1758445266265.png";
import videoThumbnailImage from "@assets/Screenshot 2025-09-22 at 12.15.21_1758537245258.png";
import breathingDiagram from "@assets/Screenshot 2025-09-21 at 14.32.23_1758445423086.png";
import tvaContentImage from "@assets/Screenshot 2025-09-21 at 14.38.24_1758445791011.png";
import tvaSkeletonImage from "@assets/Screenshot 2025-09-21 at 14.39.32_1758445791002.png";
import coreActivationImage from "@assets/Screenshot 2025-09-21 at 14.47.02_1758446239897.png";
import breathCoreImage from "@assets/Screenshot 2025-09-21 at 14.44.45_1758446182185.png";
import coreCompressionsImage from "@assets/Screenshot 2025-09-21 at 14.49.22_1758446389051.png";
import pelvicFloorImage from "@assets/Screenshot 2025-09-21 at 14.54.10_1758446664540.png";
import breathingActivationImage from "@assets/Screenshot 2025-09-21 at 14.55.17_1758446754817.png";
import domingImage from "@assets/Screenshot 2025-09-21 at 14.56.03_1758446776736.png";

interface NavigationProps {
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}

interface UnderstandingYourCoreSectionProps extends NavigationProps {
  articles: any[];
  onArticleClick: (article: any) => void;
}

export default function UnderstandingYourCoreSection({ 
  articles, 
  onArticleClick,
  canGoNext,
  canGoPrevious,
  navigateToNextTab,
  navigateToPreviousTab,
  getNavigationText
}: UnderstandingYourCoreSectionProps) {
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-left bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Understanding Your Core
          </CardTitle>
          <CardDescription className="text-sm font-medium text-left text-gray-600 border-l-4 border-blue-400 pl-4 bg-gradient-to-r from-blue-50 to-transparent py-2">
            Educational foundation to empower you with understanding the why behind your recovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            
            {/* Topic 1: Breathing & Core Activation */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">1</span>
                  <h3 className="text-[15px] font-semibold text-left">Breathing & Core Activation</h3>
                </div>
                <div
                  onClick={() => toggleTopic('breathing-activation')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-breathing-activation"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['breathing-activation'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['breathing-activation'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm font-semibold text-primary">Learning how to breathe properly is essential to activating your deep core muscles safely.</p>
                    <p className="text-sm">Breathwork becomes the foundation for every movement, helping reduce pressure on the abdominal wall and pelvic floor, preventing diastasis recti and pelvic floor dysfunction.</p>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <p className="font-semibold mb-2">Understanding the "Core Canister"</p>
                      <p className="mb-2">Think of your core as a canister:</p>
                      <ul className="ml-4 list-disc space-y-1 text-sm">
                        <li>The top is your diaphragm (breathing muscle).</li>
                        <li>The bottom is your pelvic floor.</li>
                        <li>The sides and front are your deep abdominal muscles (transverse abdominis).</li>
                        <li>The back is your spine and deep back muscles.</li>
                      </ul>
                      
                      {/* Anatomy Image */}
                      <div className="mt-4 mb-4 flex justify-center">
                        <div className="bg-white p-3 rounded-lg shadow-sm border max-w-sm">
                          <img 
                            src={anatomyImage} 
                            alt="Abdominal Muscle Anatomy showing Transverse Abdominis, Rectus Abdominis, Internal Oblique, and External Oblique" 
                            className="w-full h-auto rounded"
                            data-testid="img-anatomy-diagram"
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">When you inhale and exhale properly, these parts work together to create pressure and stability. Mismanaged breathing (like shallow chest breathing or breath holding) can weaken this system.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 2: How To Breathe Properly: 360° Breathing */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">2</span>
                  <h3 className="text-[15px] font-semibold text-left">How To Breathe Properly: 360° Breathing</h3>
                </div>
                <div
                  onClick={() => toggleTopic('360-breathing')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-360-breathing"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['360-breathing'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['360-breathing'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://youtu.be/B53GBfgME9E" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-360-breathing-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        360 Degree Breathing
                      </a>
                    </div>
                    
                    <p className="text-sm">360° breathing is a deep, diaphragmatic breathing technique that encourages expansion in all directions — front, sides, and back — rather than just the chest or belly.</p>
                    
                    {/* Breathing Diagram */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-md">
                        <img 
                          src={breathingDiagram} 
                          alt="Core Breath diagram showing inhale and exhale patterns with 360 degree expansion"
                          className="w-full h-auto rounded"
                          style={{
                            filter: 'contrast(1.1) brightness(1.05)',
                            mixBlendMode: 'multiply'
                          }}
                          data-testid="img-breathing-diagram"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <p className="font-semibold mb-2">Steps to Practice 360° Breathing:</p>
                      <ol className="ml-4 list-decimal space-y-2 text-sm">
                        <li>Sit upright or stand tall with a neutral pelvis (not tucked or overly arched).</li>
                        <li>Place one hand on your ribs and the other on your belly.</li>
                        <li><strong>Inhale slowly through your nose:</strong>
                          <ul className="ml-4 list-disc mt-1 space-y-1">
                            <li>Feel your ribs expand outward and slightly back.</li>
                            <li>The belly will naturally expand, but not only the belly — imagine your entire torso filling up with air.</li>
                          </ul>
                        </li>
                        <li><strong>Exhale slowly through your mouth:</strong>
                          <ul className="ml-4 list-disc mt-1 space-y-1">
                            <li>Feel your ribs move back inward.</li>
                            <li>Gently engage your deep core (your lower belly will naturally "hug in" slightly without forcefully sucking in).</li>
                          </ul>
                        </li>
                      </ol>
                    </div>
                    
                    <div className="text-center p-3 bg-primary/10 rounded">
                      <p className="italic font-medium text-sm">Think "expand in all directions on inhale, gently recoil on exhale."</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 3: Understanding Your Core & TVA Engagement */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">3</span>
                  <h3 className="text-[15px] font-semibold text-left">Understanding Your Core & TVA Engagement</h3>
                </div>
                <div
                  onClick={() => toggleTopic('tva-engagement')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-tva-engagement"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['tva-engagement'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['tva-engagement'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://www.youtube.com/watch?v=h7MxrsIGCxo" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-tva-engagement-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Core & TVA Engagement
                      </a>
                    </div>

                    <p className="text-sm">Why "pull your belly in" isn't enough — and what to do instead. Before you can rebuild strength, you need to understand what you're actually connecting to. Your Transverse Abdominis (TVA) is your body's innermost abdominal muscle — often called the "corset" muscle — and it's the foundation of true core strength. Without proper TVA engagement, even "core exercises" can make things worse.</p>
                    
                    {/* Skeleton Graphics Side by Side */}
                    <div className="flex justify-center gap-4 my-6">
                      <div className="bg-white p-3 rounded-lg shadow-sm border max-w-xs">
                        <img 
                          src={tvaSkeletonImage} 
                          alt="Skeleton showing TVA muscle anatomy and location"
                          className="w-full h-auto rounded"
                          data-testid="img-tva-skeleton"
                        />
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-primary text-lg">✨</span>
                        <p className="font-semibold text-primary">What is the TVA?</p>
                      </div>
                      <p className="text-sm mb-3">The <strong>TRANSVERSE ABDOMINAL MUSCLE (TVA)</strong> wraps horizontally around your entire torso, from your ribs to your pelvis, like a wide supportive belt. <strong>It attaches at your spine and wraps forward toward your belly button, stabilizing your:</strong></p>
                      <ul className="ml-4 list-disc space-y-1 text-sm">
                        <li>Spine</li>
                        <li>Internal organs</li>
                        <li>Lower back</li>
                        <li>Pelvic floor</li>
                        <li>Rib cage</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-primary text-lg">✨</span>
                        <p className="font-semibold text-primary">Why It Matters:</p>
                      </div>
                      <p className="text-sm mb-3">The TVA helps hold you together from the inside. <strong>It supports posture, protects the spine, & helps reduce or prevent:</strong></p>
                      <ul className="ml-4 list-disc space-y-1 text-sm">
                        <li>Diastasis recti</li>
                        <li>Pelvic floor dysfunction</li>
                        <li>Lower back pain</li>
                        <li>Poor pressure management (bulging or doming of the abdomen)</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-primary text-lg">✨</span>
                        <p className="font-semibold text-primary">How to engage your TVA:</p>
                      </div>
                      
                      <p className="font-semibold text-sm mb-2">Here's how to feel your TVA working:</p>
                      <ul className="ml-4 space-y-2 text-sm">
                        <li><strong>❖ Sit tall or lie down, maintaining a neutral spine.</strong></li>
                        <li><strong>❖ Inhale through your nose:</strong> feel ribs & belly gently expand in all directions (360° breath).</li>
                        <li><strong>❖ Exhale slowly through your mouth with a soft "sss" or "shhh" —</strong> and imagine your ribs knitting in, your hip bones drawing slightly toward each other, & lower belly gently drawing back.</li>
                        <li><strong>❖ You should feel tension around your entire waistline, like a corset tightening.</strong></li>
                      </ul>
                      
                      <div className="mt-4 p-3 bg-primary/10 rounded">
                        <p className="font-semibold text-sm mb-2">Try thinking of it as:</p>
                        <ul className="ml-4 space-y-1 text-sm">
                          <li><strong>❖ "Wrapping your core from the back to the front"</strong></li>
                          <li><strong>❖ "Zipping up your lower belly from pelvis to ribs"</strong></li>
                          <li><strong>❖ "Lifting from your pelvic floor to your ribs as you exhale"</strong></li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                      <p className="font-semibold text-sm mb-2 text-primary">Cue Tips:</p>
                      <ul className="ml-4 space-y-1 text-sm">
                        <li><strong>❖ Avoid hard sucking or hollowing</strong> - this shuts off the core.</li>
                        <li><strong>❖ Don't tuck your pelvis</strong> - keep a soft, natural curve in your lower back.</li>
                        <li><strong>❖ The movement should feel subtle but not superficial or grippy.</strong></li>
                        <li><strong>❖ Over time, this will become your core foundation during movement, lifting, and breath.</strong></li>
                      </ul>
                    </div>

                    <div className="bg-primary/10 p-4 rounded">
                      <p className="font-semibold text-sm mb-2 text-primary">Final Reminder:</p>
                      <ul className="ml-4 space-y-1 text-sm">
                        <li><strong>❖ You don't need to brace, clench, or crunch to train your core.</strong></li>
                        <li><strong>❖ You need connection — and that begins with your breath and TVA.</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 4: How To Engage Your Core With Breathing */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">4</span>
                  <h3 className="text-[15px] font-semibold text-left">How To Engage Your Core With Breathing</h3>
                </div>
                <div
                  onClick={() => toggleTopic('core-breathing')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-core-breathing"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['core-breathing'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['core-breathing'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm">Once you master 360° breathing, you can learn to add gentle core activation — especially important before and during any exercise or lifting movements.</p>
                    
                    {/* Your Breath & Your Core Diagram */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-lg">
                        <img 
                          src={breathCoreImage} 
                          alt="Your Breath and Your Core - anatomical diagram showing breathing and core connection"
                          className="w-full h-auto rounded"
                          data-testid="img-breath-core-diagram"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold text-primary mb-3">Steps to Activate Core:</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-sm mb-2">1. Start with your 360° breath</p>
                          <p className="text-sm">Inhale into ribs, sides, and back. Exhale gently, allowing belly to draw in slightly.</p>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-sm mb-2">2. Add core engagement on exhale</p>
                          <p className="text-sm">As you exhale, imagine gently zipping up your pelvic floor and lower abs. Think "draw in & up" without clenching or sucking.</p>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-sm mb-2">3. Maintain tension while breathing</p>
                          <p className="text-sm">Continue to breathe while keeping that gentle core connection. Don't hold your breath!</p>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-sm mb-2">4. Practice while moving</p>
                          <p className="text-sm">Try this during daily tasks: lifting your baby, standing up, or bending down. Exhale and engage before you move.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <p className="font-semibold text-yellow-800 mb-2">Common Mistakes to Avoid:</p>
                      <ul className="ml-4 list-disc space-y-1 text-sm text-yellow-700">
                        <li>Holding your breath (keep breathing throughout!)</li>
                        <li>Over-gripping or clenching (keep it gentle and natural)</li>
                        <li>Tucking your pelvis under (maintain neutral spine)</li>
                        <li>Pushing out or bearing down (think "lift" not "push")</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 5: Core Compressions & How They Help You Heal */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">5</span>
                  <h3 className="text-[15px] font-semibold text-left">Core Compressions & How They Help You Heal</h3>
                </div>
                <div
                  onClick={() => toggleTopic('core-compressions')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-core-compressions"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['core-compressions'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['core-compressions'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://youtu.be/h_S_tq0-Pv0" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-core-compressions-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Core Compressions Tutorial
                      </a>
                    </div>

                    <p className="text-sm">Core compressions are gentle, intentional exercises that help you actively bring your separated abdominal muscles back toward the midline. They're not crunches or sit-ups—they're controlled, mindful movements designed to rebuild strength and connection.</p>
                    
                    {/* Core Compressions Image */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-lg">
                        <img 
                          src={coreCompressionsImage} 
                          alt="Core Compressions technique demonstration"
                          className="w-full h-auto rounded"
                          data-testid="img-core-compressions"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold text-primary mb-3">How Core Compressions Help:</h4>
                      <ul className="ml-4 list-disc space-y-2 text-sm">
                        <li><strong>Strengthen the linea alba</strong> (the connective tissue along your midline)</li>
                        <li><strong>Re-train deep core muscles</strong> to work together</li>
                        <li><strong>Reduce the gap</strong> between your rectus abdominis (the "six-pack" muscles)</li>
                        <li><strong>Improve function</strong> - better posture, less back pain, more stability</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                      <p className="font-semibold text-blue-800 mb-2">When to Do Core Compressions:</p>
                      <p className="text-sm text-blue-700">Practice these daily—ideally before or during your workouts. They prime your body to move safely and correctly.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 6: Understanding the Pelvic Floor */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">6</span>
                  <h3 className="text-[15px] font-semibold text-left">Understanding the Pelvic Floor</h3>
                </div>
                <div
                  onClick={() => toggleTopic('pelvic-floor')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-pelvic-floor"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['pelvic-floor'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['pelvic-floor'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://youtu.be/h7MxrsIGCxo" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-pelvic-floor-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Understanding Pelvic Floor
                      </a>
                    </div>

                    <p className="text-sm">Your pelvic floor is a group of muscles that form a supportive "hammock" at the base of your pelvis. It plays a crucial role in core stability, bladder control, and overall strength.</p>
                    
                    {/* Pelvic Floor Image */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-lg">
                        <img 
                          src={pelvicFloorImage} 
                          alt="Pelvic Floor anatomy and location"
                          className="w-full h-auto rounded"
                          data-testid="img-pelvic-floor"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold text-primary mb-3">What Your Pelvic Floor Does:</h4>
                      <ul className="ml-4 list-disc space-y-2 text-sm">
                        <li>Supports your bladder, uterus, and bowel</li>
                        <li>Controls urination and bowel movements</li>
                        <li>Assists in core stability and posture</li>
                        <li>Plays a role in sexual function</li>
                        <li>Works with your diaphragm and deep core during breathing</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                      <p className="font-semibold text-purple-800 mb-2">Common Pelvic Floor Issues After Childbirth:</p>
                      <ul className="ml-4 list-disc space-y-1 text-sm text-purple-700">
                        <li>Leaking urine when coughing, sneezing, or exercising (stress incontinence)</li>
                        <li>Urgency or frequency in needing to urinate</li>
                        <li>Pelvic organ prolapse (feeling of heaviness or bulging)</li>
                        <li>Difficulty controlling bowel movements</li>
                        <li>Pain or discomfort during intercourse</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <p className="font-semibold text-green-800 mb-2">How This Program Helps Your Pelvic Floor:</p>
                      <p className="text-sm text-green-700 mb-2">
                        By coordinating your breath with core engagement, you'll naturally support your pelvic floor without doing isolated "Kegel" exercises. This integrated approach helps restore function and prevent further issues.
                      </p>
                      <p className="text-sm text-green-700 italic">
                        If you're experiencing severe symptoms, consult a pelvic floor physiotherapist for personalized assessment and treatment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 7: Warning Signs: Doming, Coning & When to Modify */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">7</span>
                  <h3 className="text-[15px] font-semibold text-left">Warning Signs: Doming, Coning & When to Modify</h3>
                </div>
                <div
                  onClick={() => toggleTopic('warning-signs')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-warning-signs"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['warning-signs'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['warning-signs'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://www.youtube.com/watch?v=IxnoXYCtnUw" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-warning-signs-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Understanding Doming & Coning
                      </a>
                    </div>

                    <p className="text-sm font-semibold text-primary">Doming or coning happens when your abdominal wall bulges or pushes outward during movement—usually a sign that your deep core isn't fully engaged.</p>
                    
                    <p className="text-sm">This is your body's way of saying: "I'm not ready for this movement yet." And that's okay! It's not a failure—it's feedback.</p>
                    
                    {/* Doming Image */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-lg">
                        <img 
                          src={domingImage} 
                          alt="Doming and Coning visual demonstration"
                          className="w-full h-auto rounded"
                          data-testid="img-doming"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <p className="font-semibold text-red-800 mb-2">When to Modify or Stop:</p>
                      <ul className="ml-4 list-disc space-y-2 text-sm text-red-700">
                        <li><strong>You see a visible bulge or ridge</strong> down the center of your belly during movement</li>
                        <li><strong>You feel pressure</strong> bearing down in your pelvic floor or abdomen</li>
                        <li><strong>You experience pain</strong> in your back, pelvis, or abdomen</li>
                        <li><strong>You leak urine</strong> during the exercise</li>
                        <li><strong>You feel unstable or wobbly</strong> in your core</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <p className="font-semibold text-green-800 mb-2">What to Do Instead:</p>
                      <ul className="ml-4 list-disc space-y-2 text-sm text-green-700">
                        <li><strong>Regress the movement</strong> - Make it easier or reduce range of motion</li>
                        <li><strong>Add more breath support</strong> - Exhale on the effort and engage your core before moving</li>
                        <li><strong>Slow down</strong> - Moving slowly gives your muscles time to respond</li>
                        <li><strong>Choose a different exercise</strong> - There's always an alternative that works better for your body right now</li>
                        <li><strong>Rest when needed</strong> - Recovery is part of the process</li>
                      </ul>
                    </div>
                    
                    <div className="text-center p-3 bg-primary/10 rounded">
                      <p className="italic font-medium text-sm">Remember: Progress isn't about pushing through pain or pressure. It's about moving smarter, not harder.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Navigation Buttons */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {canGoPrevious() && (
                <Button
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
                  data-testid="button-previous-section-understanding"
                  onClick={navigateToPreviousTab}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {getNavigationText('prev')}
                </Button>
              )}
              {canGoNext() && (
                <Button
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm sm:text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
                  data-testid="button-next-section"
                  onClick={navigateToNextTab}
                >
                  {getNavigationText('next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">Empower yourself with knowledge about your core recovery</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
