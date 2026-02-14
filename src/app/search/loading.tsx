import { Skeleton } from '@/components/ui/Skeleton';
import { GRID_CLASSES } from '@/lib/vibe';

export default function SearchLoading() {
    return (
        <div className="max-w-[900px] mx-auto px-6 py-8 md:px-20 md:py-20">
            <div className="flex items-center justify-between mb-12 text-sm">
                <Skeleton.Shimmer className="h-4 w-28" />
            </div>

            <section>
                <div className={GRID_CLASSES}>
                    {/* Search bar */}
                    <div className="col-span-2 md:col-span-4 p-5 md:p-6 bg-vc-dark min-h-[70px] flex items-center">
                        <Skeleton.Shimmer className="h-5 w-full max-w-md bg-[var(--vc-skeleton-dark)]" />
                    </div>
                    {/* Builders section */}
                    <Skeleton.SectionHeader width="w-24" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton.Tile key={`b${i}`} span={2} minH="120px" lines={2} />
                    ))}
                    {/* Showcases section */}
                    <Skeleton.SectionHeader width="w-28" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton.Tile key={`s${i}`} span={2} minH="100px" lines={2} />
                    ))}
                </div>
            </section>
        </div>
    );
}
