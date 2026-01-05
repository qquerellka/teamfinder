import { FC, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { getHackathonPath } from "@/shared/routing/paths";
import { HackathonCard, useHackathonsQuery } from "@/entities/hackathon";
import { IconButton, Input } from "@telegram-apps/telegram-ui";
import { useDebouncedValue } from "@/shared/helpers/useDebounceValue";
import { InputSection, NoItems, SIcon } from "@/shared/ui";

export const HackathonList: FC = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 800);

  const q = debouncedSearch.trim() || undefined;

  const { data } = useHackathonsQuery({ q });

  return (
    <Wrapper>
      <SearchSection>
        <InputSection>
          <SInput
            before={<SIcon name="search" color={""} />}
            placeholder="Название хакатона"
            value={search}
            // style={{width: '100%', boxSizing:'border-box'}}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputSection>
        <IconButton>
          <SIcon name="filters" />
        </IconButton>
      </SearchSection>
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
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Grid = styled.section`
  display: grid;
  gap: 12px;
`;

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  gap: 1rem;
`;

const SInput = styled(Input)`
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  & > input {
    margin-top: 2px;
    font-size: 14px;
    line-height: 18px;
  }
`;
