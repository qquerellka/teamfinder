import { FC, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { getHackathonPath } from "@/shared/routing/paths";
import { HackathonCard, useHackathonsQuery } from "@/entities/hackathon";
import {
  Button,
  Cell,
  Checkbox,
  IconButton,
  Input,
  Modal,
} from "@telegram-apps/telegram-ui";
import { useDebouncedValue } from "@/shared/helpers/useDebounceValue";
import { InputSection, NoItems, SIcon, SText } from "@/shared/ui";

interface HackathonsFilters {
  online: boolean;
  offline: boolean;
  hybrid: boolean;
  withPrize: boolean;
}

export const HackathonList: FC = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 800);

  const q = debouncedSearch.trim() || undefined;

  const { data } = useHackathonsQuery({ q });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState<HackathonsFilters>({
    online: false,
    offline: false,
    hybrid: false,
    withPrize: false,
  });

  return (
    <>
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
          <IconButton onClick={() => setIsModalOpen(true)}>
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
      <Modal open={isModalOpen}>
        <ModalContainer>
          <SText>{"Фильтры"}</SText>
          <Cell
            before={
              <Checkbox
                name="online"
                checked={filters.online}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, online: e.target.checked }))
                }
              />
            }
          >
            {"Онлайн"}
          </Cell>
          <Cell
            before={
              <Checkbox
                name="offline"
                checked={filters.offline}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, offline: e.target.checked }))
                }
              />
            }
          >
            {"Оффлайн"}
          </Cell>
          <Cell
            before={
              <Checkbox
                name="hybrid"
                checked={filters.hybrid}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, hybrid: e.target.checked }))
                }
              />
            }
          >
            {"Гибрид"}
          </Cell>
          <Cell
            before={
              <Checkbox
                name="withPrize"
                checked={filters.withPrize}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    withPrize: e.target.checked,
                  }))
                }
              />
            }
          >
            {"С призовыми"}
          </Cell>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Button
              mode="bezeled"
              type="button"
              stretched
              // disabled={loading}
              onClick={() => setIsModalOpen(false)}
            >
              {"Сбросить"}
            </Button>

            <Button
              type="button"
              stretched
              // loading={loading}
              // onClick={onConfirm}
              onClick={() => setIsModalOpen(false)}
            >
              {"Применить"}
            </Button>
          </div>
        </ModalContainer>
      </Modal>
    </>
  );
};

const ModalContainer = styled.section`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 0.5rem;
`;

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

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
