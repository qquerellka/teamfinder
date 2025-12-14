// import { FC } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconButton } from "@telegram-apps/telegram-ui";
// import styled from "styled-components";

// import { MegaInvite } from "@/entities/invite";
// import { useAnswerOnInvite } from "@/features/invite/manage-list/hooks/useAnswerOnInvite";
// import { getHackathonTeamPath } from "@/shared/routing/paths";
// import { SIcon, SText } from "@/shared/ui";


// interface InviteCardProps {
//   invite: MegaInvite;
// }
// export const InviteCard: FC<InviteCardProps> = ({ invite }) => {
//   const navigate = useNavigate();
//   const { answer, isLoading } = useAnswerOnInvite({
//     inviteId: invite.id,
//     onAnswered: () => {
//       navigate(getHackathonTeamPath(String(invite.teamId)));
//     },
//   });
//   return (
//     <Wrapper>
//       <FirstRow>
//         <SText $fs={16} $fw={700}>
//           {"Приглашение"}
//         </SText>
//         <Buttons>
//           <IconButton disabled={isLoading} onClick={() => answer("rejected")}>
//             <SIcon name={"cross"} color={"#F55A5A"} />
//           </IconButton>

//           <IconButton disabled={isLoading} onClick={() => answer("accepted")}>
//             <SIcon name={"plus"} />
//           </IconButton>
//         </Buttons>
//       </FirstRow>
//       <SecondRow>
//         <SText $fs={14} $fw={500}>
//           {invite.teamName}
//         </SText>

//         <CountTeamMembers>
//           <SIcon name={"profile"} />
//           <SText $fs={14} $fw={500}>
//             {invite.teamMembersCount} / {invite.teamMembersLimit}
//           </SText>
//         </CountTeamMembers>
//       </SecondRow>
//     </Wrapper>
//   );
// };

// const CountTeamMembers = styled.div`
//   display: flex;
//   flex-direction: row;
//   justify-content: center;
//   align-items: center;
//   gap: 0.5rem;
// `;

// const Wrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 0.5rem;
//   padding: 0.75rem;
//   border-radius: 1rem;
//   background-color: var(--tg-theme-section-bg-color);
// `;

// const FirstRow = styled.div`
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
//   align-items: center;
// `;

// const SecondRow = styled.div`
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
//   align-items: center;
// `;

// const Buttons = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   gap: 0.5rem;
// `;
