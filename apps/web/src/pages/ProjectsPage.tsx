import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Project } from '../types';

export function ProjectsPage() {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get<Project[]>('/projects')).data,
  });

  return (
    <section className="panel p-6">
      <h2 className="font-display text-2xl font-bold text-ink">Converted projects</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{project.projectCode}</p>
            <p className="mt-2 font-display text-xl font-bold text-ink">{project.name}</p>
            <p className="mt-3 text-sm text-slate-500">{project.scopeSummary || 'No scope summary'}</p>
          </article>
        ))}
      </div>
    </section>
  );
}