import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, Target, Dumbbell } from "lucide-react";

interface ProgramCardProps {
  memberProgram: any;
  userId: string;
}

export default function ProgramCard({ memberProgram, userId }: ProgramCardProps) {
  const { program } = memberProgram;
  const progressPercentage = (memberProgram.progress / program.workoutCount) * 100;

  const getStatusBadge = () => {
    if (memberProgram.progress === program.workoutCount) {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    if (memberProgram.isActive) {
      return <Badge className="bg-pink-500">Active</Badge>;
    }
    return <Badge variant="outline">Inactive</Badge>;
  };

  // Format dates for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const purchaseDate = memberProgram.purchaseDate ? new Date(memberProgram.purchaseDate) : null;
  const expiryDate = memberProgram.expiryDate ? new Date(memberProgram.expiryDate) : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Program Image */}
      {program.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={program.imageUrl}
            alt={program.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="p-6 space-y-4">
        {/* Program Name and Status */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {program.name}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {program.description}
        </p>

        {/* Program Details Grid */}
        <div className="grid grid-cols-2 gap-3 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4 text-pink-500" />
            <span>{program.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="w-4 h-4 text-pink-500" />
            <span>{program.level || 'Postnatal'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Dumbbell className="w-4 h-4 text-pink-500" />
            <span>{program.workoutCount} Workouts</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-pink-500" />
            <span>{program.equipment || 'Minimal'}</span>
          </div>
        </div>

        {/* Dates */}
        {(purchaseDate || expiryDate) && (
          <div className="space-y-2 text-xs text-gray-500 pt-2 border-t">
            {purchaseDate && (
              <div className="flex items-center justify-between">
                <span>Purchased:</span>
                <span className="font-medium">{formatDate(purchaseDate.toISOString())}</span>
              </div>
            )}
            {expiryDate && (
              <div className="flex items-center justify-between">
                <span>Expires:</span>
                <span className="font-medium">{formatDate(expiryDate.toISOString())}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="text-pink-600 font-bold">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-500">
            {memberProgram.progress} of {program.workoutCount} workouts completed
          </p>
        </div>

        {/* Continue Button */}
        <Link href={`/${program.slug || 'heal-your-core'}`}>
          <button
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all"
            data-testid={`button-continue-${program.id}`}
          >
            Continue Program
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}
