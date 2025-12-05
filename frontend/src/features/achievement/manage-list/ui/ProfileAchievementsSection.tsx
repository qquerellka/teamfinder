// import { useNavigate } from "react-router-dom";
// import styled from "styled-components";
// import { IconButton, List, Section } from "@telegram-apps/telegram-ui";

// import { STitle } from "@/shared/ui/STitle";
// import { SIcon } from "@/shared/ui/SIcon";
// import plusIcon from "@/assets/icons/plusIcon.svg";
// import { useAuthUser } from "@/entities/user/api/hooks";
// import { AchievementItem } from "@/widgets/achievements/AchievementItem";
// import { paths } from "@/app/routing/paths";

// export const ProfileAchievementsSection = () => {
//   const navigate = useNavigate();
//   const { data: user } = useAuthUser();

//   return (

//       <>
//         {user?.achievements?.map((a) => (
//           <AchievementItem key={a.id} achievement={a} />
//         ))}
//       </>
//   );
// };


// const SSection = styled(Section)`
//   /* background: var(--tg-theme-section-bg-color, #fff); */
//   /* padding: 1rem; */
//   /* border-radius: 1rem; */

// `;

// const HeaderRow = styled.div`
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
//   align-items: center;
// `;
