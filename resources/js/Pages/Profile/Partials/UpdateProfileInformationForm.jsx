import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        fname: user.fname,
        lname: user.lname,
        mi: user.mi || '', // Handle null MIs
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                
                {/* Name Fields Container */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* First Name */}
                    <div className="md:col-span-5">
                        <InputLabel htmlFor="fname" value="First Name" />
                        <TextInput
                            id="fname"
                            className="mt-1 block w-full"
                            value={data.fname}
                            onChange={(e) => setData('fname', e.target.value)}
                            required
                            isFocused
                            autoComplete="given-name"
                        />
                        <InputError className="mt-2" message={errors.fname} />
                    </div>

                    {/* Middle Initial - NEW */}
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="mi" value="M.I." />
                        <TextInput
                            id="mi"
                            className="mt-1 block w-full"
                            value={data.mi}
                            onChange={(e) => setData('mi', e.target.value)}
                            maxLength="5"
                        />
                        <InputError className="mt-2" message={errors.mi} />
                    </div>

                    {/* Last Name */}
                    <div className="md:col-span-5">
                        <InputLabel htmlFor="lname" value="Last Name" />
                        <TextInput
                            id="lname"
                            className="mt-1 block w-full"
                            value={data.lname}
                            onChange={(e) => setData('lname', e.target.value)}
                            required
                            autoComplete="family-name"
                        />
                        <InputError className="mt-2" message={errors.lname} />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                            <p className="text-sm mt-2 text-gray-800">
                                Your email address is unverified.
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Click here to re-send the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 font-medium text-sm text-green-600">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    )}
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