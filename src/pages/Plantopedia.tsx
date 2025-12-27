import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, 
  Sun, 
  Droplets, 
  Sparkles, 
  TreeDeciduous, 
  Flower2,
  TrendingUp,
  TrendingDown,
  Info,
  Filter
} from "lucide-react";

type PlantRarity = 'common' | 'uncommon' | 'rare' | 'exotic';
type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface Plant {
  id: string;
  name: string;
  scientificName: string | null;
  description: string;
  imageUrl: string | null;
  category: string;
  rarity: PlantRarity;
  peakSeason: Season;
  availableSeasons: Season[];
  basePrice: string;
  careLevel: string;
  sunRequirement: string;
  waterRequirement: string;
  growthRate: string | null;
  matureHeight: string | null;
  isNative: boolean | null;
  attractsPollinators: boolean | null;
  dynamicPrice: number;
  rarityMultiplier: number;
  seasonalAdjustment: number;
  currentSeason: Season;
  isInSeason: boolean;
  priceBreakdown: {
    base: number;
    afterRarity: number;
    final: number;
  };
}

interface PlantsResponse {
  data: Plant[];
  currentSeason: Season;
  filters: {
    rarities: PlantRarity[];
    seasons: Season[];
  };
}

const rarityColors: Record<PlantRarity, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  exotic: "bg-purple-500",
};

const rarityBorderColors: Record<PlantRarity, string> = {
  common: "border-gray-300",
  uncommon: "border-green-400",
  rare: "border-blue-400",
  exotic: "border-purple-400",
};

const seasonIcons: Record<Season, React.ReactNode> = {
  spring: <Flower2 className="w-4 h-4" />,
  summer: <Sun className="w-4 h-4" />,
  fall: <TreeDeciduous className="w-4 h-4" />,
  winter: <Sparkles className="w-4 h-4" />,
};

const seasonColors: Record<Season, string> = {
  spring: "bg-pink-100 text-pink-800",
  summer: "bg-yellow-100 text-yellow-800",
  fall: "bg-orange-100 text-orange-800",
  winter: "bg-blue-100 text-blue-800",
};

export default function Plantopedia() {
  const [selectedRarity, setSelectedRarity] = useState<PlantRarity | 'all'>('all');
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');

  const { data: plantsData, isLoading, error } = useQuery<PlantsResponse>({
    queryKey: ['/api/plants', selectedRarity, selectedSeason],
    queryFn: async () => {
      let url = '/api/plants';
      const params = new URLSearchParams();
      if (selectedRarity !== 'all') params.set('rarity', selectedRarity);
      if (selectedSeason !== 'all') params.set('season', selectedSeason);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch plants');
      return res.json();
    },
  });

  const plants = plantsData?.data || [];
  const currentSeason = plantsData?.currentSeason || 'winter';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4 font-serif" data-testid="text-page-title">
            Plantopedia
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of plants with dynamic pricing based on rarity and seasonal availability.
          </p>
          
          <div className="mt-6 inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-green-200">
            <span className="text-sm text-gray-500">Current Season:</span>
            <Badge className={`${seasonColors[currentSeason]} flex items-center gap-1`}>
              {seasonIcons[currentSeason]}
              <span className="capitalize">{currentSeason}</span>
            </Badge>
          </div>
        </motion.div>

        <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm border border-green-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-green-800">Filters</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rarity</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedRarity === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRarity('all')}
                  data-testid="button-filter-all-rarity"
                >
                  All
                </Button>
                {(['common', 'uncommon', 'rare', 'exotic'] as PlantRarity[]).map((rarity) => (
                  <Button
                    key={rarity}
                    variant={selectedRarity === rarity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRarity(rarity)}
                    className="capitalize"
                    data-testid={`button-filter-${rarity}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${rarityColors[rarity]} mr-2`} />
                    {rarity}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Peak Season</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSeason === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeason('all')}
                  data-testid="button-filter-all-season"
                >
                  All
                </Button>
                {(['spring', 'summer', 'fall', 'winter'] as Season[]).map((season) => (
                  <Button
                    key={season}
                    variant={selectedSeason === season ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSeason(season)}
                    className="capitalize"
                    data-testid={`button-filter-${season}`}
                  >
                    {seasonIcons[season]}
                    <span className="ml-1">{season}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-800 mb-2">Dynamic Pricing Explained</h3>
              <p className="text-sm text-gray-600 mb-3">
                Our prices adjust automatically based on two factors:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white/60 rounded-lg p-3">
                  <span className="font-medium text-green-700">Rarity Multipliers:</span>
                  <ul className="mt-1 space-y-1 text-gray-600">
                    <li><span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2" />Common: Base price</li>
                    <li><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />Uncommon: 1.5x</li>
                    <li><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />Rare: 2.5x</li>
                    <li><span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2" />Exotic: 4x</li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <span className="font-medium text-green-700">Seasonal Adjustments:</span>
                  <ul className="mt-1 space-y-1 text-gray-600">
                    <li className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      In-season: Best prices
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      Off-season: 10-50% premium
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            Failed to load plants. Please try again.
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Leaf className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No plants found. Check back soon for our growing collection!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`h-full overflow-hidden border-2 ${rarityBorderColors[plant.rarity]} hover:shadow-lg transition-shadow`}
                  data-testid={`card-plant-${plant.id}`}
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center">
                    {plant.imageUrl ? (
                      <img 
                        src={plant.imageUrl} 
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Leaf className="w-20 h-20 text-green-300" />
                    )}
                    
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={`${rarityColors[plant.rarity]} text-white capitalize`}>
                        {plant.rarity}
                      </Badge>
                      {plant.isInSeason && (
                        <Badge className="bg-green-500 text-white">
                          In Season
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3">
                      <Badge className={seasonColors[plant.peakSeason]}>
                        {seasonIcons[plant.peakSeason]}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-green-800">
                      {plant.name}
                    </CardTitle>
                    {plant.scientificName && (
                      <p className="text-sm text-gray-500 italic">{plant.scientificName}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {plant.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Sun className="w-4 h-4" />
                        {plant.sunRequirement}
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="w-4 h-4" />
                        {plant.waterRequirement}
                      </span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-400 line-through">
                            Base: ${plant.priceBreakdown.base.toFixed(2)}
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            ${plant.dynamicPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>Rarity: {plant.rarityMultiplier}x</p>
                          <p className={plant.seasonalAdjustment > 1 ? 'text-orange-500' : 'text-green-500'}>
                            Season: {plant.seasonalAdjustment > 1 ? '+' : ''}{((plant.seasonalAdjustment - 1) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-1">
                      {plant.isNative && (
                        <Badge variant="outline" className="text-xs">Native</Badge>
                      )}
                      {plant.attractsPollinators && (
                        <Badge variant="outline" className="text-xs">Pollinator Friendly</Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {plant.careLevel} Care
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
