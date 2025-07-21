'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './_components/Navbar';
import { SideBar } from './_components/SideBar';
import { motion, AnimatePresence } from 'framer-motion';

const steps = ['name', 'phone', 'referral', 'course'] as const;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	const [formCompleted, setFormCompleted] = useState<boolean | null>(null);
	const [showLogo, setShowLogo] = useState(false);
	const [stepIndex, setStepIndex] = useState(0);

	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		referral: '',
		course: '',
	});

	useEffect(() => {
		const completed = localStorage.getItem('formCompleted') === 'true';
		setFormCompleted(completed);

		const savedData = localStorage.getItem('formData');
		if (savedData) {
			const parsed = JSON.parse(savedData);
			setFormData(parsed);

			const nextIndex = steps.findIndex((step) => !parsed[step]);
			setStepIndex(nextIndex >= 0 ? nextIndex : steps.length - 1);
		}

		if (completed) {
			setShowLogo(true);
			setTimeout(() => {
				setShowLogo(false);
			}, 2000);
		}
	}, []);

	const currentStep = steps[stepIndex];

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const updated = { ...formData, [currentStep]: e.target.value };
		setFormData(updated);
		localStorage.setItem('formData', JSON.stringify(updated));
	};

	const handleNext = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData[currentStep]) return;

		if (stepIndex < steps.length - 1) {
			setStepIndex((i) => i + 1);
		} else {
			localStorage.setItem('formCompleted', 'true');
			setFormCompleted(true);

			const selectedCourse = {
				id: formData.course.toLowerCase().replace(/\s+/g, '-'),
				title: formData.course,
				imageUrl: '/default-course.jpg',
				chapters: [],
				price: 0,
				progress: 0,
				category: { name: 'Self-Enrolled' },
			};
			console.log(formData.course);

			const current = JSON.parse(localStorage.getItem('savedCourses') || '[]');

			const alreadyExists = current.some((course: { id: string }) => course.id === selectedCourse.id);

			if (!alreadyExists) {
				current.push(selectedCourse);
				localStorage.setItem('savedCourses', JSON.stringify(current));
			}

			setShowLogo(true);
			setTimeout(() => {
				setShowLogo(false);
			}, 2000);
		}
	};

	const handleBack = () => {
		if (stepIndex > 0) setStepIndex((i) => i - 1);
	};

	const progressPercent = ((stepIndex + 1) / steps.length) * 100;

	if (formCompleted === null) return null;

	if (!formCompleted) {
		return (
			<div className='h-screen flex items-center justify-center bg-gray-100 px-4'>
				<form
					onSubmit={handleNext}
					className='relative overflow-hidden bg-white p-6 rounded-lg shadow-md w-full max-w-md'>
					<div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
						<div
							className='bg-blue-600 h-2 rounded-full transition-all duration-300'
							style={{ width: `${progressPercent}%` }}
						/>
					</div>

					<AnimatePresence mode='wait'>
						<motion.div
							key={currentStep}
							initial={{ x: 300, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -300, opacity: 0 }}
							transition={{ duration: 0.4 }}
							className='space-y-4'>
							<h2 className='text-xl font-bold capitalize'>{currentStep}</h2>

							{currentStep === 'referral' ? (
								<select value={formData.referral} onChange={handleChange} className='w-full p-2 border rounded'>
									<option value=''>Where did you hear about us?</option>
									<option value='Telegram'>Telegram</option>
									<option value='YouTube'>YouTube</option>
									<option value='Facebook'>Facebook</option>
									<option value='Instagram'>Instagram</option>
									<option value='Friend'>Friend</option>
								</select>
							) : currentStep === 'course' ? (
								<select value={formData.course} onChange={handleChange} className='w-full p-2 border rounded'>
									<option value=''>Choose your course</option>
									<option value='Frontend Development'>Frontend Development</option>
									<option value='Backend Development'>Backend Development</option>
									<option value='UI/UX Design'>UI/UX Design</option>
									<option value='Mobile App Dev'>Mobile App Development</option>

									<option value='software developemnt'>software developemnt</option>
								</select>
							) : (
								<input
									type={currentStep === 'phone' ? 'tel' : 'text'}
									placeholder={`Enter your ${currentStep}`}
									value={formData[currentStep]}
									onChange={handleChange}
									className='w-full p-2 border rounded'
								/>
							)}

							<div className='flex justify-between'>
								<button
									type='button'
									onClick={handleBack}
									disabled={stepIndex === 0}
									className='px-4 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50'>
									Back
								</button>
								<button
									type='submit'
									disabled={!formData[currentStep]}
									className='bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50'>
									{stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
								</button>
							</div>
						</motion.div>
					</AnimatePresence>
				</form>
			</div>
		);
	}
	if (showLogo) {
		return (
			<motion.div
				className='h-screen flex items-center justify-center bg-black'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.8 }}>
				<motion.img
					src='/aco-foot.png' // <-- replace with your actual logo
					alt='Welcome'
					initial={{ scale: 0.7, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 1, ease: 'easeOut' }}
					className='w-40 h-auto'
				/>
			</motion.div>
		);
	}

	return (
		<div className='h-full'>
			{/* Navbar */}
			<div className='h-[80px] md:pl-56 fixed inset-y-0 w-full z-50'>
				<Navbar />
			</div>

			{/* Sidebar */}
			<div className='hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50'>
				<SideBar />
			</div>

			{/* Main Content */}
			<main className='md:pl-56 pt-[80px] h-full'>{children}</main>
		</div>
	);
};

export default DashboardLayout;
