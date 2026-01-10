import { GetServerSidePropsContext } from "next";
import { getDocument } from "./api/read";
import { fetchSiteByContext } from "@/lib/dynamodb";
import { withBasePath } from "@/lib/paths";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const site = await fetchSiteByContext(context);

  if (site) {
    const redirect = site.redirect;
    if (redirect) {
      return {
        redirect,
      };
    }

    // Use 301 instead of 308 by manually setting status code
    if (context.res) {
      context.res.writeHead(301, { Location: withBasePath("/read") });
      context.res.end();
      return { props: {} };
    }

    return {
      redirect: {
        destination: "/read",
        permanent: true,
      },
    };
  }

  const { user_id } = site;

  const document_id = context.params?.document_id;

  if (typeof user_id !== "string" || typeof document_id !== "string") {
    throw new Error("Invalid query");
  }

  const document = await getDocument(user_id, document_id);

  return { props: { site, document } };
};

const Page = () => {
  return (
    <div>
      <img src="Philips_PM5544.svg" alt="TBD" />
    </div>
  );
};

export default Page;
