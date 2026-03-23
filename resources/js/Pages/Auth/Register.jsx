import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    // 1. Ensure useForm matches the new database fields
    const { data, setData, post, processing, errors, reset } = useForm({
        fname: '',
        lname: '',
        mi: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                {/* --- START OF NEW NAME FIELDS --- */}
                
                {/* First Name */}
                <div>
                    <InputLabel htmlFor="fname" value="First Name" />
                    <TextInput
                        id="fname"
                        name="fname"
                        value={data.fname}
                        className="mt-1 block w-full"
                        autoComplete="given-name"
                        isFocused={true}
                        onChange={(e) => setData('fname', e.target.value)}
                        required
                    />
                    <InputError message={errors.fname} className="mt-2" />
                </div>

                {/* Last Name */}
                <div className="mt-4">
                    <InputLabel htmlFor="lname" value="Last Name" />
                    <TextInput
                        id="lname"
                        name="lname"
                        value={data.lname}
                        className="mt-1 block w-full"
                        autoComplete="family-name"
                        onChange={(e) => setData('lname', e.target.value)}
                        required
                    />
                    <InputError message={errors.lname} className="mt-2" />
                </div>

                {/* Middle Initial */}
                <div className="mt-4">
                    <InputLabel htmlFor="mi" value="Middle Initial (Optional)" />
                    <TextInput
                        id="mi"
                        name="mi"
                        value={data.mi}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('mi', e.target.value)}
                        maxLength="5" // Limit length for MI
                    />
                    <InputError message={errors.mi} className="mt-2" />
                </div>

                {/* --- END OF NEW NAME FIELDS --- */}

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}