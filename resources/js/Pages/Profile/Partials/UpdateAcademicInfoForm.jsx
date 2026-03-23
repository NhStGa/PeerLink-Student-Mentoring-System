import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateAcademicInfoForm({ studentProfile, className = '' }) {
    // Only handle Bio now
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        bio: studentProfile?.bio || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.academic.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Introduction</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your profile bio to introduce yourself to your peers and mentors.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                
                {/* Bio / Profile Introduction */}
                <div>
                    <InputLabel htmlFor="bio" value="Bio" />
                    <textarea
                        id="bio"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        rows="4"
                        placeholder="Tell us about yourself..."
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                    ></textarea>
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}