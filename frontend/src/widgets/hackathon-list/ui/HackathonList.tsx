import { FC, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { IconButton, Input } from '@telegram-apps/telegram-ui';

import { getHackathonPath } from '@/shared/routing/paths';
import { HackathonCard, useHackathonsQuery } from '@/entities/hackathon';
import { useDebouncedValue } from '@/shared/helpers/useDebounceValue';
import { InputSection, NoItems, SIcon } from '@/shared/ui';
import { FilterModal, useFilters } from '@/features/hackathon/filters';

export const HackathonList: FC = () => {
  const [search, setSearch] = useState('');
  
  const debouncedSearch = useDebouncedValue(search, 800);
  const q = debouncedSearch.trim() || undefined;

  const filters = useFilters();

  const { data } = useHackathonsQuery({
    q,
    mode: filters.queryParams.mode,
    prize_fund: filters.queryParams.hasPrize,
  });

  const handleResetAll = useCallback(() => {
    filters.resetFilters();
    setSearch('');
  }, [filters]);

  // Проверка активных фильтров (оба фильтра)
  const hasActiveFilters = filters.appliedMode !== '' || filters.appliedMoney !== null;

  return (
    <>
      <Wrapper>
        <SearchSection>
          <InputSection>
            <SInput
              before={<SIcon name="search" color={''} />}
              placeholder="Название хакатона"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </InputSection>
          <IconButton onClick={filters.openModal}>
            <SIcon
              name="filters"
              color={hasActiveFilters ? 'var(--tg-theme-link-color)' : ''}
            />
          </IconButton>
        </SearchSection>
        {data.items.length === 0 ? (
          <NoItems title={'Ничего не нашлось :('} />
        ) : (
          <Grid>
            {data.items.map(h => (
              <CardLink key={h.id} to={getHackathonPath(`${h.id}`)}>
                <HackathonCard hackathon={h} />
              </CardLink>
            ))}
          </Grid>
        )}
      </Wrapper>

      <FilterModal
        isOpen={filters.isModalOpen}
        onClose={filters.closeModal}
        mode={filters.mode}
        onModeChange={filters.setMode}
        money={filters.money}
        onMoneyChange={filters.setMoney}
        onApply={filters.applyFilters}
        onReset={handleResetAll}
      />
    </>
  );
};

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