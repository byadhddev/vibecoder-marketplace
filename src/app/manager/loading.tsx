import { Skeleton } from '@/components/ui/Skeleton';
import { GRID_CLASSES } from '@/lib/vibe';

export default function ManagerLoading() {
    return (
        <div className="max-w-[900px] mx-auto px-6 py-8 md:px-20 md:py-20">
            <div className="flex items-center justify-between mb-12 text-sm">
                <Skeleton.Shimmer className="h-4 w-28" />
                <Skeleton.Shimmer className="h-7 w-7 rounded-sm" />
            </div>

            <section>
                {/* Profile section */}
                <div className={GRID_CLASSES}>
                    <Skeleton.ArtodeTile />
                    <Skeleton.TitleTile />
                    <Skeleton.CounterTile />
                    {/* Profile fields */}
                    <Skeleton.Tile span={2} minH="120px" lines={2} />
                    <Skeleton.Tile span={2} minH="100px" lines={3} />
                    <Skeleton.Tile span={2} minH="80px" lines={2} />
                    <Skeleton.Tile span={2} minH="80px" lines={2} />
                </div>

                {/* Showcase form section */}
                <div className={`${GRID_CLASSES} mt-8`}>
                    <Skeleton.ArtodeTile />
                    <Skeleton.TitleTile />
                    <Skeleton.CounterTile />
                    <Skeleton.Tile span={4} minH="60px" lines={1} />
                    <Skeleton.Tile span={4} minH="60px" lines={1} />
                    <Skeleton.Tile span={4} minH="100px" lines={3} />
                </div>

                {/* Existing showcases */}
                <div className={`${GRID_CLASSES} mt-8`}>
                    <Skeleton.SignatureTile />
                    <Skeleton.Tile span={2} minH="80px" lines={1} />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton.Tile key={i} span={2} minH="140px" />
                    ))}
                </div>
            </section>
        </div>
    );
}
