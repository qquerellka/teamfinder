import { FC } from "react";
import styled from "styled-components";
import { HackathonList } from "@/widgets/hackathon-list/ui/HackathonList";

export const HackathonsPage: FC = () => {
  return (
    <Wrapper>
      <HackathonList />
    </Wrapper>
  );
};

const Wrapper = styled.section`
  flex: 1; /* растягиваемся внутри SContent */

  display: grid;
  gap: 12px;
`;

export default HackathonsPage;
