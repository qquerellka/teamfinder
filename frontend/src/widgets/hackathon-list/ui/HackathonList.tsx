import { FC, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { getHackathonPath } from "@/shared/routing/paths";
import { HackathonCard, useHackathonsQuery } from "@/entities/hackathon";
import { Input } from "@telegram-apps/telegram-ui";
import { useDebouncedValue } from "@/shared/helpers/useDebounceValue";
import { InputSection, NoItems } from "@/shared/ui";

export const HackathonList: FC = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 800);

  const q = debouncedSearch.trim() || undefined;

  const { data } = useHackathonsQuery({ q });

  return (
    <>
      <InputSection>
        <Input
          placeholder="Название хакатона"
          value={search}
          // style={{width: '100%', boxSizing:'border-box'}}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputSection>

      {data.items.length === 0 ? (
        <NoItems title={"Ничего не нашлось :("} />
      ) : (
        <Grid>
          {data.items.map((h) => (
            <CardLink key={h.id} to={getHackathonPath(`${h.id}`)}>
              <HackathonCard hackathon={h} />
            </CardLink>
          ))}
        </Grid>
      )}
    </>
  );
};

const Grid = styled.section`
  display: grid;
  gap: 12px;
`;

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;