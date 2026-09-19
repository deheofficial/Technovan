import React from 'react';
import { useParams } from 'react-router-dom';
import PageScaffold from './components/PageScaffold';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useNavigate } from 'react-router-dom';
import ChangeManagementScreen from './screens/ChangeManagementScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import apiClient from '@technovan/utils';
import { useAppDispatch, useAppSelector } from './hooks';
import { register } from './store/slices/authSlice';

export function HomePage() { return <HomeScreen />; }
export function LoginPage() { return <LoginScreen />; }
export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = React.useState({ firstName: '', lastName: '', email: '', password: '' });
  const submit = async () => {
    try {
      await dispatch(register(form)).unwrap();
      navigate('/dashboard');
    } catch { /* auth state exposes the API error */ }
  };
  return <PageScaffold title="Create account" description="Register for the TECHNOVAN platform.">
    <View className="max-w-xl rounded-xl border border-gray-800 bg-gray-900 p-6">
      {(['firstName', 'lastName', 'email', 'password'] as const).map((field) => <TextInput key={field} secureTextEntry={field === 'password'} value={form[field]} onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))} placeholder={field.replace(/([A-Z])/g, ' $1')} placeholderTextColor="#9ca3af" className="mb-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white" />)}
      {error && <Text className="mb-3 text-red-400">{error}</Text>}
      <Pressable disabled={loading} onPress={submit} className="rounded-lg bg-teal-500 px-4 py-3"><Text className="text-center font-semibold text-white">{loading ? 'Creating account...' : 'Create account'}</Text></Pressable>
    </View>
  </PageScaffold>;
}
export function DashboardPage() { return <PageScaffold title="Dashboard" description="Your project activity and account overview." />; }
export function ProjectsPage() { return <PageScaffold title="My Projects" description="Track your active and completed projects." />; }
export function PaymentsPage() { return <PageScaffold title="Payments" description="Review project billing and payment activity." />; }
export function AdminOverviewPage() { return <PageScaffold title="Dashboard" description="Operational overview and platform activity." />; }
export function AdminServicesPage() { return <PageScaffold title="Services" description="Manage TECHNOVAN service offerings." />; }
export function AdminPricingPage() { return <PageScaffold title="Pricing" description="Manage pricing plans and packages." />; }
export function AdminProjectsPage() { return <PageScaffold title="All Projects" description="Review every project in the platform." />; }
export function AdminBlogPage() { return <PageScaffold title="Blog" description="Manage articles and published content." />; }
export function AdminInquiriesPage() { return <PageScaffold title="Inquiries" description="Review and respond to customer inquiries." />; }
export function AdminQuotationPage() { return <PageScaffold title="Quotation" description="Create and manage customer quotations." />; }
export function AdminChangeManagementPage() { return <ChangeManagementScreen />; }

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const result = await apiClient.get(`/blog/${encodeURIComponent(slug || '')}`) as any;
        if (active) setArticle(result);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <PageScaffold title="Loading article" description="Fetching the article..." />;
  if (!article) return <PageScaffold title="Article not found" description="This article is unavailable or unpublished." />;
  return <PageScaffold title={article.title} description={article.excerpt || ''}><ViewArticle content={article.content} /></PageScaffold>;
}

function ViewArticle({ content }: { content: string }) {
  return <Text className="article-content text-gray-200">{content}</Text>;
}
