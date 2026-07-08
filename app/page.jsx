import { BdayReminderSection } from 'components/BdayReminderSection';
import { HomeSearchSection } from 'components/HomeSearchSection';
import { LatestNotesSection } from 'components/LatestNotesSection';
import { QuickGiftIdeasSection } from 'components/QuickGiftIdeasSection';
import { SavedPeopleSection } from 'components/SavedPeopleSection';

export default function Page() {
    return (
        <div className="mx-auto flex w-full max-w-sm flex-col text-black gap-7">
            <HomeSearchSection />

            <div className="flex flex-col gap-7">
                <QuickGiftIdeasSection />
                <BdayReminderSection />
                <SavedPeopleSection />
                <LatestNotesSection />
            </div>
        </div>
    );
}
