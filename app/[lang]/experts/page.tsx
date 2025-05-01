import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container } from '@/components/layout/container';
import { getDictionary, Locale } from '@/lib/i18n/dictionaries';
import { fetchExperts } from '@/lib/api/experts';
import { ExpertCard } from '@/components/ExpertCard';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Expert {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  image: string;
}

interface ExpertsPageProps {
  lang: Locale;
}

const ExpertsPage: React.FC<ExpertsPageProps> = ({ lang }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExperts = async () => {
      const data = await fetchExperts();
      setExperts(data);
      setLoading(false);
    };

    loadExperts();
  }, []);

  const dict = getDictionary(lang);

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-6">{dict.experts.title}</h1>
      <p className="mb-6">{dict.experts.description}</p>
      <div className="mb-6">
        <Map experts={experts} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>{dict.experts.loading}</p>
        ) : (
          experts.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))
        )}
      </div>
    </Container>
  );
};

export default ExpertsPage;
