import { Skeleton } from '@/components/ui/Skeleton';
import { GRID_CLASSES } from '@/lib/vibe';

export default function ProfileLoading() {
    return (
        <div className="max-w-[900px] mx-auto px-6 py-8 md:px-20 md:py-20">
            <div className="flex items-center justify-between mb-12 text-sm">
                <Skeleton.Shimmer className="h-4 w-28" />
                <Skeleton.Shimmer className="h-4 w-20" />
            </div>

            <section>
                <div className={GRID_CLASSES}>
                    <Skeleton.ArtodeTile />
                    <Skeleton.TitleTile />
                    <Skeleton.CounterTile />
                    {/* Status tile */}
                    <div className="col-span-1 p-5 bg-white flex items-center justify-center min-h-[120px]">
                        <Skeleton.Shimmer className="h-3 w-16" />
                    </div>
                    {/* Avatar */}
                    <Skeleton.AvatarTile />
                    {/* Info tiles */}
                    <Skeleton.Tile span={2} minH="120px" lines={2} />
                    <Skeleton.SignatureTile />
                    <Skeleton.Tile span={2} minH="100px" lines={2} />
                    {/* Showcases */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton.Tile key={i} span={2} minH="160px" />
                    ))}
                    <Skeleton.SignatureTile />
                    <Skeleton.Tile span={2} minH="80px" lines={1} />
                </div>
            </section>
        </div>
    );
}
