import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { IconButton, Input, Pagination } from '@telegram-apps/telegram-ui';

import { getHackathonPath } from '@/shared/routing/paths';
import { HackathonCard, useHackathonsQuery } from '@/entities/hackathon';
import { useDebouncedValue } from '@/shared/helpers/useDebounceValue';
import { InputSection, NoItems, SIcon } from '@/shared/ui';
import { FilterModal, useFilters } from '@/features/hackathon/filters';

const PAGE_SIZE = 10;

export const HackathonList: FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 800);
  const q = debouncedSearch.trim() || undefined;

  const filters = useFilters();

  const offset = (page - 1) * PAGE_SIZE;

  const { data, isFetching } = useHackathonsQuery({
    q,
    mode: filters.queryParams.mode,
    prize_fund: filters.queryParams.hasPrize,
    status: filters.queryParams.status,
    limit: PAGE_SIZE + 1,
    offset,
  });

  useEffect(() => {
    setPage(1);
  }, [q, filters.queryParams.mode, filters.queryParams.hasPrize, filters.queryParams.status]);

  const hasNext = (data?.items?.length ?? 0) > PAGE_SIZE;
  const items = useMemo(
    () => (hasNext ? data!.items.slice(0, PAGE_SIZE) : (data?.items ?? [])),
    [data?.items, hasNext],
  );
  const count = hasNext ? page + 1 : page;

  const handleResetAll = useCallback(() => {
    filters.resetFilters();
    setSearch('');
  }, [filters]);
  const handlePageChange = useCallback((_: unknown, p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const hasActiveFilters = filters.appliedMode !== '' && filters.appliedMoney !== null;

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
              maxLength={64}
            />
          </InputSection>
          <IconButton onClick={filters.openModal}>
            <SIcon name="filters" color={hasActiveFilters ? 'var(--tg-theme-link-color)' : ''} />
          </IconButton>
        </SearchSection>
        {items.length === 0 ? (
          <NoItems title={'Ничего не нашлось :('} />
        ) : (
          <>
            <Grid>
              {items.map(h => (
                <CardLink key={h.id} to={getHackathonPath(`${h.id}`)}>
                  <HackathonCard hackathon={h} />
                </CardLink>
              ))}
            </Grid>

            {count > 1 && (
              <PaginationRow>
                <Pagination
                  count={count}
                  page={page}
                  onChange={handlePageChange}
                  disabled={isFetching}
                  boundaryCount={1}
                  siblingCount={1}
                  hideNextButton={!hasNext}
                  hidePrevButton={page === 1}
                />
              </PaginationRow>
            )}
          </>
        )}
      </Wrapper>

      <FilterModal
        isOpen={filters.isModalOpen}
        onClose={filters.closeModal}
        mode={filters.mode}
        onModeChange={filters.setMode}
        money={filters.money}
        onMoneyChange={filters.setMoney}
        status={filters.status}
        onStatusChange={filters.setStatus}
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
  align-items: center;
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

const PaginationRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;
