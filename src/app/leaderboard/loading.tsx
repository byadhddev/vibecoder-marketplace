import { Skeleton } from '@/components/ui/Skeleton';
import { GRID_CLASSES } from '@/lib/vibe';

export default function LeaderboardLoading() {
    return (
        <div className="max-w-[900px] mx-auto px-6 py-8 md:px-20 md:py-20">
            <div className="flex items-center justify-between mb-12 text-sm">
                <Skeleton.Shimmer className="h-4 w-28" />
                <div className="flex items-center gap-3">
                    <Skeleton.Shimmer className="h-4 w-16" />
                    <Skeleton.Shimmer className="h-4 w-20" />
                </div>
            </div>

            <section>
                <div className={GRID_CLASSES}>
                    <Skeleton.ArtodeTile />
                    <Skeleton.TitleTile />
                    <Skeleton.CounterTile />
                    {/* Sort controls */}
                    <div className="col-span-2 md:col-span-4 p-4 bg-white flex items-center gap-3 min-h-[50px]">
                        <Skeleton.Shimmer className="h-6 w-20 rounded-sm" />
                        <Skeleton.Shimmer className="h-6 w-20 rounded-sm" />
                        <div className="flex-1" />
                        <Skeleton.Shimmer className="h-5 w-16 rounded-sm" />
                        <Skeleton.Shimmer className="h-5 w-16 rounded-sm" />
                    </div>
                    {/* 8 ranked builder cards */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton.Tile key={i} span={2} minH="160px" />
                    ))}
                    <Skeleton.SignatureTile />
                    <Skeleton.Tile span={2} minH="80px" lines={1} />
                </div>
            </section>
        </div>
    );
}
