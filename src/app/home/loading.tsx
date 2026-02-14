import { Skeleton } from '@/components/ui/Skeleton';
import { GRID_CLASSES } from '@/lib/vibe';

export default function HomeLoading() {
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
                    {/* Status */}
                    <div className="col-span-1 p-5 bg-vc-surface flex items-center justify-center min-h-[120px]">
                        <Skeleton.Shimmer className="h-3 w-16" />
                    </div>
                    {/* CTA tiles */}
                    <Skeleton.Tile span={2} minH="140px" lines={3} />
                    <Skeleton.Tile span={2} minH="140px" lines={3} />
                    <Skeleton.Tile span={2} minH="120px" lines={2} dark />
                    {/* Avatar grid */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton.AvatarTile key={i} />
                    ))}
                    <Skeleton.SignatureTile />
                    <Skeleton.Tile span={2} minH="80px" lines={1} />
                    {/* More avatars */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton.AvatarTile key={`b${i}`} />
                    ))}
                </div>
            </section>
        </div>
    );
}
