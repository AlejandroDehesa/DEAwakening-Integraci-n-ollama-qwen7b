import { useParams } from "react-router-dom";

function EventDetail() {
  const { slug } = useParams();

  return (
    <section className="page-section">
      <div className="container">
        <span className="eyebrow">Event Detail</span>
        <h1>{slug?.replace(/-/g, " ")}</h1>
        <p className="page-copy">
          Dynamic route connected and ready for future event data.
        </p>
      </div>
    </section>
  );
}

export default EventDetail;
