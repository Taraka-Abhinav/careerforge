import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Compass } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PublicContentService, type PublicContentResource, type PublicResourceType } from '../services/publicContentService';

interface PublicResourcePageProps {
  type: PublicResourceType;
}

export default function PublicResourcePage({ type }: PublicResourcePageProps) {
  const params = useParams();
  const slug = type === 'career' ? params.careerName : params.skillName;
  const [resource, setResource] = useState<PublicContentResource | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    PublicContentService.getResource(type, slug).then((next) => {
      if (!isMounted) return;
      setResource(next);
      document.title = `${next.title} | CareerForge`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', next.summary);
    });

    return () => {
      isMounted = false;
    };
  }, [slug, type]);

  if (!resource) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Loading CareerForge resource...</p>
      </div>
    );
  }

  const sections = resource.metadata.sections || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/5 bg-neutral-900/50 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> CareerForge
          </Link>
          <Button size="sm" onClick={() => { window.location.href = '/signup'; }}>Start roadmap</Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
        <section className="space-y-4">
          <Badge color="indigo">{type === 'career' ? 'Career Path' : 'Skill Guide'}</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight">{resource.title}</h1>
          <p className="text-neutral-400 max-w-2xl leading-relaxed">{resource.summary}</p>
          {!resource.isPublished && (
            <Badge color="neutral">Reusable public-page architecture</Badge>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title} className="p-6 border-white/5">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                {type === 'career' ? <Compass className="w-5 h-5 text-indigo-400" /> : <BookOpen className="w-5 h-5 text-indigo-400" />}
                {section.title}
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed">{section.body}</p>
            </Card>
          ))}
        </div>

        {resource.metadata.relatedSkills?.length ? (
          <Card className="p-6 border-white/5">
            <h2 className="font-bold text-white mb-4">Related skills</h2>
            <div className="flex flex-wrap gap-2">
              {resource.metadata.relatedSkills.map((skill) => (
                <Badge key={skill} color="neutral">{skill}</Badge>
              ))}
            </div>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
