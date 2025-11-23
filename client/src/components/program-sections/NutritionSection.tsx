import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import nutritionBowlImage from "@assets/Screenshot 2025-09-22 at 21.26.02_1758556777492.png";
import handPortionsImage from "@assets/Screenshot_2025-09-22_at_21.52.32-removebg-preview_1758558857702.png";

interface NavigationProps {
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}

function TheRoleOfNutritionSection({ 
  canGoNext, 
  canGoPrevious, 
  navigateToNextTab, 
  navigateToPreviousTab,
  getNavigationText 
}: NavigationProps) {
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const topics = [
    {
      id: 'why-nutrition-matters',
      title: 'Why Nutrition Matters for Recovery',
      number: 1
    },
    {
      id: 'postpartum-nutrition-priorities',
      title: 'Postpartum Nutrition Priorities',
      number: 2
    },
    {
      id: 'portion-quantity-guidance',
      title: 'Portion & Quantity Guidance',
      number: 3
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-8 text-left">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent drop-shadow-sm">
              The Role of Nutrition
            </h2>
            <p className="text-sm font-medium text-gray-600 border-l-4 border-green-400 pl-4 bg-gradient-to-r from-green-50 to-transparent py-2">
              Your nutrition foundation for postpartum recovery and long-term strength
            </p>
          </div>

          <div className="space-y-0">
            {topics.map((topic, index) => (
              <div key={topic.id}>
                <div className="flex items-center justify-between py-5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">{topic.number}</span>
                    <h3 className="text-[15px] font-semibold text-left">{topic.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTopic(topic.id)}
                    className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                    data-testid={`button-toggle-${topic.id}`}
                  >
                    <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics[topic.id] ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                {expandedTopics[topic.id] && (
                  <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                    {topic.id === 'why-nutrition-matters' ? (
                      <div className="space-y-6 text-sm">
                        <div className="flex justify-center mb-6">
                          <div className="bg-white p-4 rounded-lg shadow-sm border max-w-md">
                            <img 
                              src={nutritionBowlImage} 
                              alt="Balanced nutrition bowl with protein, vegetables, and healthy fats"
                              className="w-full h-auto rounded"
                            />
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                          Your body has just done something extraordinary. From pregnancy through birth to postpartum, you've carried life, gone through hormonal shifts, and possibly breastfed—all while running on less sleep and more stress than you probably ever imagined. And now, you're here, trying to rebuild your core, reconnect with your body, and feel like yourself again.
                        </p>
                        
                        <p className="text-gray-700 leading-relaxed">
                          <strong>Here's the thing—</strong> Exercise is only one part of the equation. No amount of "working out" can outperform poor recovery strategies. And one of the most powerful, accessible tools for healing, strength, and long-term results? <strong>Nutrition.</strong>
                        </p>

                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 p-5 rounded-lg">
                          <h4 className="font-bold mb-3 text-pink-600 text-base">But Here's What Nutrition is NOT:</h4>
                          <div className="space-y-2 text-gray-700">
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>A diet or calorie restriction</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>A set of rules that make you feel guilty</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>Something you need to be "perfect" at</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>A punishment for having a baby body</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-5 rounded-lg">
                          <h4 className="font-bold mb-3 text-green-600 text-base">Instead, Nutrition is:</h4>
                          <div className="space-y-2 text-gray-700">
                            <div className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span><strong>Fuel for recovery</strong> - helping your tissues heal, your hormones balance, and your energy return</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span><strong>Foundation for strength</strong> - you can't build muscle, repair connective tissue, or improve performance without adequate nutrition</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span><strong>Support for your mental and emotional well-being</strong> - stable blood sugar = stable mood, better sleep, clearer thinking</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span><strong>A way to honor your body</strong> - not punish it</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed italic">
                          You don't need to track macros, count calories, or follow a restrictive meal plan. You just need to understand what your body needs right now—and make choices that support you, not deplete you.
                        </p>
                      </div>
                    ) : topic.id === 'postpartum-nutrition-priorities' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold mb-4">POSTPARTUM NUTRITION <span className="text-pink-500">PRIORITIES</span></h3>
                          <p className="text-gray-700 leading-relaxed">
                            These aren't "rules." They're reminders of what your body actually needs to repair, rebuild, and thrive. 
                            Think of this as a framework, not a diet—flexible, forgiving, and designed to work with your life (not against it).
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f2038b'}}>
                            <div className="p-4" style={{backgroundColor: '#f2038b'}}>
                              <h4 className="font-bold text-white text-lg">QUALITY PROTEIN</h4>
                              <p className="text-white text-sm mt-1">For tissue repair & muscle retention</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Eggs</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Chicken</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Fish</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Dal (Lentils)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Paneer</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Greek Yogurt</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Tofu</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f2038b'}}>
                            <div className="p-4" style={{backgroundColor: '#f2038b'}}>
                              <h4 className="font-bold text-white text-lg">HEALTHY FATS</h4>
                              <p className="text-white text-sm mt-1">Essential for hormones, brain, + milk supply</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Ghee (Small Amounts)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Sesame Seeds (Til)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Coconut</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Soaked Almonds</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Flaxseeds</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Groundnut Chutney</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3c0e4'}}>
                            <div className="p-4" style={{backgroundColor: '#b3c0e4'}}>
                              <h4 className="font-bold text-lg" style={{color: '#5e73c4'}}>COMPLEX CARBS</h4>
                              <p className="text-sm mt-1" style={{color: '#5e73c4'}}>Balances blood sugar, supports energy + digestion</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Bajra (Pearl Millet)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Jowar (Sorghum)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Red Rice</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Oats</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Poha With Veggies</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Sabudana (Sago)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Sweet Potato</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#cbde9a'}}>
                            <div className="p-4" style={{backgroundColor: '#cbde9a'}}>
                              <h4 className="font-bold text-lg" style={{color: '#7fb030'}}>MICRONUTRIENTS</h4>
                              <p className="text-sm mt-1" style={{color: '#7fb030'}}>Supports wound healing and replenishes lost iron/zinc</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Beetroot</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Leafy Greens</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Citrus Fruits</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Jaggery</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Sesame Seeds</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Methi (Fenugreek)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Sabzis With Haldi + Jeera</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 p-5 rounded-lg mt-6">
                          <h4 className="font-bold mb-3 text-pink-600 text-base">BONUS RECOVERY TIPS</h4>
                          <div className="space-y-2 text-gray-700">
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span><strong>Iron-Rich Add-ons:</strong> supports postpartum blood levels</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span><strong>Healthy Fats:</strong> for hormone tissue repair and hormonal support</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span><strong>Timing Matters:</strong> Eat within an hour of waking and don't skip meals — it keeps your body in healing mode</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span><strong>Homemade First:</strong> Home-cooked (with minimal refined oil or sugar) are ideal — they're familiar, balanced, and warm.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : topic.id === 'portion-quantity-guidance' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold mb-4">PORTION & <span className="text-pink-500">QUANTITY GUIDANCE</span></h3>
                          <p className="text-gray-700 leading-relaxed">
                            A flexible way to fuel healing without counting or obsessing. You don't need to track macros or 
                            calories to support your recovery. But it is helpful to have a general guide for how much your body 
                            may need — especially as you rebuild strength, support your core, and possibly breastfeed.
                          </p>
                        </div>

                        <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3c0e4'}}>
                          <div className="p-4" style={{backgroundColor: '#b3c0e4'}}>
                            <h4 className="font-bold text-lg" style={{color: '#5e73c4'}}>YOUR HANDS = YOUR BUILT-IN PORTION GUIDE</h4>
                            <p className="text-sm mt-1" style={{color: '#5e73c4'}}>Using your hands makes portioning simple and personal to your body</p>
                          </div>
                          <div className="p-6">
                            <div className="text-center mb-4">
                              <img 
                                src={handPortionsImage} 
                                alt="Hand portion guide showing protein (palm), vegetables (fist), carbs (cupped hand), and fats (thumb)"
                                className="w-full max-w-2xl mx-auto rounded-lg"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f3a8cb'}}>
                            <div className="p-4" style={{backgroundColor: '#f3a8cb'}}>
                              <h4 className="font-bold text-lg" style={{color: '#d1507a'}}>FOR EACH MAIN MEAL (3x/day), AIM FOR:</h4>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f2038b'}}>
                            <div className="p-4" style={{backgroundColor: '#f2038b'}}>
                              <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                <span>🤚</span> PALM-SIZED PROTEIN
                              </h4>
                              <p className="text-white text-sm mt-1">1 palm = about 20–30g protein</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Chicken</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Fish</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Tofu</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Eggs</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Beans</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Lentils</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3c0e4'}}>
                            <div className="p-4" style={{backgroundColor: '#b3c0e4'}}>
                              <h4 className="font-bold text-lg flex items-center gap-2" style={{color: '#5e73c4'}}>
                                <span>✊</span> FIST-SIZED VEGGIES
                              </h4>
                              <p className="text-sm mt-1" style={{color: '#5e73c4'}}>Go for variety & fiber to support digestion</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Cooked Vegetables</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Raw Vegetables</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>All Colors</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Leafy Greens</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#cbde9a'}}>
                            <div className="p-4" style={{backgroundColor: '#cbde9a'}}>
                              <h4 className="font-bold text-lg flex items-center gap-2" style={{color: '#7fb030'}}>
                                <span>🤲</span> CUPPED-HAND COMPLEX CARBS
                              </h4>
                              <p className="text-sm mt-1" style={{color: '#7fb030'}}>Adjust depending on activity and energy</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Oats</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Quinoa</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Sweet Potato</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Rice</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Fruit</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3a892'}}>
                            <div className="p-4" style={{backgroundColor: '#b3a892'}}>
                              <h4 className="font-bold text-lg flex items-center gap-2" style={{color: '#8b7355'}}>
                                <span>👍</span> THUMB OF HEALTHY FAT
                              </h4>
                              <p className="text-sm mt-1" style={{color: '#8b7355'}}>Adjust depending on activity and energy</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Nut Butters</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Oils</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Avocado</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Seeds</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f3a8cb'}}>
                            <div className="p-4" style={{backgroundColor: '#f3a8cb'}}>
                              <h4 className="font-bold text-lg flex items-center gap-2" style={{color: '#d1507a'}}>
                                <span>🤱</span> PLUS EXTRA IF BREASTFEEDING
                              </h4>
                              <p className="text-sm mt-1" style={{color: '#d1507a'}}>Add another ½—1 palm of carbs or fat</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Add Between Meals:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Eggs</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Greek Yogurt</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Trail Mix</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3a892'}}>
                            <div className="p-4" style={{backgroundColor: '#b3a892'}}>
                              <h4 className="font-bold text-white text-lg flex items-center gap-2" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1)'}}>
                                <span>🕐</span> HOW OFTEN TO EAT
                              </h4>
                            </div>
                            <div className="p-5">
                              <div className="space-y-3 text-sm">
                                <p className="font-semibold text-gray-800">Try to eat every 3–4 hours to:</p>
                                <ul className="space-y-2 text-gray-700">
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Keep blood sugar stable</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Support steady milk supply</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Avoid energy crashes or overeating later</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>If you're hungrier more often — eat. Your healing body knows what it needs.</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f3a8cb'}}>
                            <div className="p-4" style={{backgroundColor: '#f3a8cb'}}>
                              <h4 className="font-bold text-white text-lg flex items-center gap-2" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1)'}}>
                                <span>💝</span> REMEMBER
                              </h4>
                            </div>
                            <div className="p-5">
                              <div className="space-y-3 text-sm">
                                <ul className="space-y-2 text-gray-700">
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>You're not "eating too much" — you're eating enough to heal & function</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Don't under fuel and then expect energy or results — your body is your teammate</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Stay hydrated! Often, fatigue is just low fluid intake</span>
                                  </li>
                                </ul>
                              </div>
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
        </CardContent>
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
              data-testid="button-previous-section-nutrition"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              {getNavigationText('prev')}
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-next-section-nutrition"
              onClick={navigateToNextTab}
            >
              {getNavigationText('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Fuel your body for optimal recovery</p>
        </div>
      </div>
    </div>
  );
}

export default TheRoleOfNutritionSection;
