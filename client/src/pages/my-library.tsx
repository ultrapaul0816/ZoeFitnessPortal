import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibraryItem {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  description: string;
  thumbnailUrl: string;
  program: string;
}

export default function MyLibrary() {
  const [libraryItems] = useState<LibraryItem[]>([
    {
      id: "1",
      title: "Navigating Relationships As a New Parent",
      speaker: "Rhonda Richards-Smith",
      duration: "40:36",
      description: "Rhonda Richards Smith - Navigating Relationships As a New Parent [41 minutes]",
      thumbnailUrl: "",
      program: "The Mama Summit"
    },
    {
      id: "2", 
      title: "Honoring Your Birth During Challenges Times",
      speaker: "Dr. Sarah Bjorkman",
      duration: "26:46",
      description: "The Doctors Bjorkman - Honoring Your Birth During Challenges Times [27 minutes]",
      thumbnailUrl: "",
      program: "The Mama Summit"
    },
    {
      id: "3",
      title: "5 Things To Stop Doing To Get Your Sleep Back",
      speaker: "The Speech Sisters",
      duration: "32:15",
      description: "The Speech Sisters - 5 Things To Stop Doing To Get Your Sleep Back [32 minutes]",
      thumbnailUrl: "", 
      program: "The Mama Summit"
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <button 
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
                  Back
                </span>
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {libraryItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Video Thumbnail and Content */}
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-orange-100 via-pink-50 to-orange-50 rounded-lg overflow-hidden relative">
                    {/* Background circles design */}
                    <div className="absolute inset-0">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-32 h-32 bg-white bg-opacity-20 rounded-full"></div>
                      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 w-24 h-24 bg-white bg-opacity-30 rounded-full"></div>
                      <div className="absolute left-12 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white bg-opacity-40 rounded-full"></div>
                    </div>
                    
                    {/* Speaker photo placeholder */}
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                      <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <img 
                          src={item.thumbnailUrl}
                          alt={item.speaker}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                          }}
                        />
                      </div>
                    </div>

                    {/* Program and Speaker Text Overlay */}
                    <div className="absolute right-8 top-8 text-right">
                      <div className="text-lg font-light text-gray-600 mb-1">
                        The <span className="italic">Mama</span> Summit
                      </div>
                      <div className="text-lg italic text-gray-600 mb-2">
                        {item.speaker}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.title}
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-80 text-white px-2 py-1 rounded text-sm font-medium">
                      {item.duration}
                    </div>

                    {/* Play button overlay */}
                    <button 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all group"
                      data-testid={`button-play-${item.id}`}
                    >
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <p className="text-gray-700 font-medium">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if no items */}
        {libraryItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-500">Your purchased programs and content will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}