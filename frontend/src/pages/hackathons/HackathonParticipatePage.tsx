import React from "react";
import { Navigate, useParams } from "react-router-dom";


import { paths } from "@/app/routing/paths";

import { Page } from "@/shared/ui/Page";
import { useHackathonQuery } from "@/entities/hackathon/api/hooks";
import { Input, Placeholder } from "@telegram-apps/telegram-ui";

const HackathonParticipatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: hackathon, isLoading, isError } = useHackathonQuery(Number(id));


  if (isLoading) {
    return <Placeholder>Загружаем хакатон…</Placeholder>;
  }

  if (isError || !hackathon) {
    return <Navigate to={paths.error404} replace />;
  }

  // const url = normalizeUrl((hackathon as Hackathon).registrationLink);

  // const openExternal = () => {
  //   if (!url) return;

  //   const wa = window.Telegram?.WebApp;
  //   if (wa?.openLink) {
  //     wa.openLink(url, { try_instant_view: true });
  //   } else {
  //     window.open(url, "_blank", "noopener,noreferrer");
  //   }
  // };


  return (
      <Page>
        {/* <HackathonCard hackathon={hackathon} variant="full" /> */}

        {/* <ButtonsSection>
          <SButton mode="bezeled" onClick={openExternal} disabled={!url}>
            Подробнее на сайте
          </SButton>

        </ButtonsSection> */}
        <Input></Input>
      </Page>
  );
};

export default HackathonParticipatePage;
