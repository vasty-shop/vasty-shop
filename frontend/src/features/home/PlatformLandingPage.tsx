import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe,
  Check,
  Star,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function PlatformLandingPage() {
  const { user, shops, isAuthenticated, isAdmin, isVendor, logout } = useAuth();

  const dashboardPath = isAdmin
    ? '/admin/dashboard'
    : isVendor && shops[0]
    ? `/shop/${shops[0].id}/vendor/dashboard`
    : '/profile';

  const dashboardLabel = isAdmin ? 'Admin' : isVendor ? 'Dashboard' : 'Profile';

  return (
    <div className="min-h-screen text-slate-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-indigo-100 bg-gradient-to-r from-indigo-100/80 via-violet-50/60 to-fuchsia-100/80 shadow-[0_1px_3px_rgba(99,102,241,0.08)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 ring-1 ring-white/40">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Vasty
            </span>
          </Link>
          <div className="hidden items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2 py-1.5 shadow-sm backdrop-blur md:flex">
            <a
              href="#features"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-indigo-700 hover:shadow-sm"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-indigo-700 hover:shadow-sm"
            >
              Pricing
            </a>
            <Link
              to="/shop"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-indigo-700 hover:shadow-sm"
            >
              Shop
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="hidden items-center gap-1.5 rounded-full border border-indigo-200 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur transition hover:bg-white sm:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {dashboardLabel}
                </Link>
                <span className="hidden text-sm text-slate-600 md:block">
                  {user?.metadata?.firstName || user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/20 transition hover:shadow-lg hover:shadow-indigo-600/30"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm font-medium text-slate-700 transition hover:text-indigo-700 sm:block"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/20 transition hover:shadow-lg hover:shadow-indigo-600/30"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[#FBFAF7]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.22),transparent),radial-gradient(ellipse_60%_40%_at_85%_30%,rgba(244,114,182,0.18),transparent),radial-gradient(ellipse_60%_40%_at_10%_40%,rgba(56,189,248,0.18),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/60 px-4 py-1.5 text-sm text-indigo-700 backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-medium">New — AI-powered product recommendations</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-8 max-w-4xl text-center text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl md:text-7xl"
        >
          Build the marketplace
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            of your dreams.
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-600 sm:text-xl"
        >
          Launch a multi-vendor marketplace in minutes. Payments, delivery, POS, and analytics —
          all open-source, self-hostable, and built for speed.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 font-medium text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-xl hover:shadow-indigo-600/30"
          >
            Start free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-7 py-3.5 font-medium text-slate-900 backdrop-blur transition hover:border-slate-400 hover:bg-white"
          >
            Browse the shop
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-12 flex max-w-md items-center justify-center gap-6 text-sm text-slate-500"
        >
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600" />
            No credit card
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600" />
            Free forever
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600" />
            Self-host
          </div>
        </motion.div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {[
            { label: 'Stores', value: '10k+' },
            { label: 'Products', value: '2M+' },
            { label: 'Languages', value: '17' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-[#F5F7FB]">
        <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to sell.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From your first sale to your millionth — we scale with you.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Zap className="h-6 w-6" />}
            title="Launch instantly"
            body="Sign up, add products, and start selling the same day. No setup fees, no hoops."
            gradient="from-amber-500 to-orange-600"
          />
          <Feature
            icon={<Shield className="h-6 w-6" />}
            title="Secure payouts"
            body="Stripe Connect handles vendor payouts automatically with transparent fee splits."
            gradient="from-emerald-500 to-teal-600"
          />
          <Feature
            icon={<TrendingUp className="h-6 w-6" />}
            title="AI recommendations"
            body="Built-in smart search and product suggestions that turn browsers into buyers."
            gradient="from-indigo-500 to-violet-600"
          />
          <Feature
            icon={<Globe className="h-6 w-6" />}
            title="17 languages"
            body="Reach customers worldwide with full i18n support out of the box."
            gradient="from-sky-500 to-blue-600"
          />
          <Feature
            icon={<ShoppingBag className="h-6 w-6" />}
            title="All-in-one"
            body="Storefront, POS, delivery zones, flash sales, and analytics in a single platform."
            gradient="from-fuchsia-500 to-pink-600"
          />
          <Feature
            icon={<Star className="h-6 w-6" />}
            title="Open source"
            body="MIT licensed, self-hostable, fully extensible. Own your stack completely."
            gradient="from-slate-700 to-slate-900"
          />
        </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to build something{' '}
            <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
              great?
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
            Join thousands of sellers running their marketplace on Vasty. Free forever, no card required.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-medium text-slate-900 shadow-xl transition hover:scale-[1.02]"
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="https://github.com/vasty-shop/vasty-shop"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-600">
              <ShoppingBag className="h-3.5 w-3.5 text-white" />
            </div>
            <p>&copy; {new Date().getFullYear()} Vasty. Open-source, MIT licensed.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/shop" className="transition hover:text-white">
              Shop
            </Link>
            <Link to="/login" className="transition hover:text-white">
              Sign in
            </Link>
            <Link to="/register" className="transition hover:text-white">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="group relative rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
      >
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </motion.div>
  );
}
